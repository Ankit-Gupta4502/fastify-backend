import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import {
  listUsers,
  getUserDetail,
  listInstructors,
  listGroupRooms,
  createGroupRoom,
  updateGroupRoom,
  cancelGroupRoom,
  approveInstructor,
  createInstructor,
  updateInstructorPriority,
  updateInstructorStats,
} from "../../services/admin.service";
import {
  listAllPrivateSessionRequests,
  assignPrivateSessionRequest,
  rejectPrivateSessionRequest,
} from "../../services/private-session-request.service";
import { SessionPoolError } from "../../services/session-pool.service";
import {
  approveInstructorBodySchema,
  updatePriorityBodySchema,
  updateInstructorStatsBodySchema,
  createInstructorBodySchema,
  instructorIdParamsSchema,
  listUsersQuerySchema,
  userIdParamsSchema,
  createGroupRoomBodySchema,
  roomIdParamsSchema,
  updateGroupRoomBodySchema,
  privateRequestIdParamsSchema,
  privateRequestsQuerySchema,
  assignPrivateRequestBodySchema,
  rejectPrivateRequestBodySchema,
} from "../../validation/admin.validation.schema";

export class AdminController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    const preHandler = [
      this.authMiddleware.handle,
      requireRole(USER_ROLES.ADMIN),
    ];

    app.register(
      async (router) => {
        router.get("/users", { preHandler }, this.getUsers);
        router.get("/users/:id", { preHandler }, this.getUserDetail);
        router.get("/instructors", { preHandler }, this.getInstructors);
        router.post("/instructors", { preHandler }, this.createInstructor);
        router.patch("/instructors/:id/approve", { preHandler }, this.approveInstructor);
        router.patch("/instructors/:id/priority", { preHandler }, this.updatePriority);
        router.patch("/instructors/:id/stats", { preHandler }, this.updateStats);
        router.get("/rooms/group", { preHandler }, this.getGroupRooms);
        router.post("/rooms/group", { preHandler }, this.createGroupRoom);
        router.patch("/rooms/group/:id", { preHandler }, this.updateGroupRoom);
        router.delete("/rooms/group/:id", { preHandler }, this.cancelGroupRoom);
        router.get("/rooms/private-requests", { preHandler }, this.getPrivateRequests);
        router.patch("/rooms/private-requests/:id/assign", { preHandler }, this.assignPrivateRequest);
        router.patch("/rooms/private-requests/:id/reject", { preHandler }, this.rejectPrivateRequest);
      },
      { prefix: "/admin" },
    );
  }

  private getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { query: listUsersQuerySchema });
    if (invalid) return invalid;
    const { search, role, plan, status, page, pageSize } = request.query as z.infer<
      typeof listUsersQuerySchema
    >;
    const { items, total } = await listUsers(drizzle, search, role, plan, status, page, pageSize);
    const effectivePage = page ?? 1;
    const effectivePageSize = pageSize ?? total;
    const data = {
      items,
      total,
      page: effectivePage,
      pageSize: effectivePageSize,
      totalPages: effectivePageSize > 0 ? Math.max(1, Math.ceil(total / effectivePageSize)) : 1,
    };
    const { statusCode, payload } = successResponse({ message: "Users", data });
    return reply.status(statusCode).send(payload);
  };

  private getUserDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { params: userIdParamsSchema });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof userIdParamsSchema>;
    const data = await getUserDetail(drizzle, id);
    if (!data) {
      const { statusCode, payload } = errorResponse({ message: "User not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }
    const { statusCode, payload } = successResponse({ message: "User detail", data });
    return reply.status(statusCode).send(payload);
  };

  private getInstructors = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await listInstructors(drizzle);
    const { statusCode, payload } = successResponse({ message: "Instructors", data });
    return reply.status(statusCode).send(payload);
  };

  private approveInstructor = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: instructorIdParamsSchema });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, { body: approveInstructorBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof instructorIdParamsSchema>;
    const { approve } = request.body as z.infer<typeof approveInstructorBodySchema>;

    const updated = await approveInstructor(drizzle, id, approve);
    if (!updated) {
      const { statusCode, payload } = errorResponse({ message: "Instructor not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: approve ? "Instructor approved" : "Instructor approval revoked",
      data: null,
    });
    return reply.status(statusCode).send(payload);
  };

  private createInstructor = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: createInstructorBodySchema });
    if (invalid) return invalid;

    const { name, email, password } = request.body as z.infer<typeof createInstructorBodySchema>;

    try {
      const data = await createInstructor(drizzle, { name, email, password });
      const { statusCode, payload } = successResponse({
        message: "Instructor created",
        data,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes("already")) {
        const { statusCode, payload } = errorResponse({
          message: "An account with this email already exists",
          statusCode: 409,
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  private updatePriority = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: instructorIdParamsSchema });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, { body: updatePriorityBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof instructorIdParamsSchema>;
    const { sortOrder } = request.body as z.infer<typeof updatePriorityBodySchema>;

    const updated = await updateInstructorPriority(drizzle, id, sortOrder);
    if (!updated) {
      const { statusCode, payload } = errorResponse({ message: "Instructor not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({ message: "Priority updated", data: null });
    return reply.status(statusCode).send(payload);
  };

  private updateStats = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: instructorIdParamsSchema });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, { body: updateInstructorStatsBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof instructorIdParamsSchema>;
    const body = request.body as z.infer<typeof updateInstructorStatsBodySchema>;

    const updated = await updateInstructorStats(drizzle, id, body);
    if (!updated) {
      const { statusCode, payload } = errorResponse({ message: "Instructor not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({ message: "Instructor stats updated", data: null });
    return reply.status(statusCode).send(payload);
  };

  private getGroupRooms = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await listGroupRooms(drizzle);
    const { statusCode, payload } = successResponse({ message: "Group rooms", data });
    return reply.status(statusCode).send(payload);
  };

  private getPrivateRequests = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { query: privateRequestsQuerySchema });
    if (invalid) return invalid;

    const { status } = request.query as z.infer<typeof privateRequestsQuerySchema>;
    const data = await listAllPrivateSessionRequests(drizzle, status);
    const { statusCode, payload } = successResponse({ message: "Private session requests", data });
    return reply.status(statusCode).send(payload);
  };

  private assignPrivateRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: privateRequestIdParamsSchema });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, { body: assignPrivateRequestBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof privateRequestIdParamsSchema>;
    const body = request.body as z.infer<typeof assignPrivateRequestBodySchema>;

    try {
      const data = await assignPrivateSessionRequest(drizzle, {
        requestId: id,
        instructorId: body.instructorId,
        adminNote: body.adminNote ?? null,
      });
      const { statusCode, payload } = successResponse({ message: "Session approved and room created", data });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof SessionPoolError) {
        const { statusCode, payload } = errorResponse({
          message: err.message,
          statusCode: err.statusCode,
          error: err.code,
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  private rejectPrivateRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: privateRequestIdParamsSchema });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, { body: rejectPrivateRequestBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof privateRequestIdParamsSchema>;
    const body = request.body as z.infer<typeof rejectPrivateRequestBodySchema>;

    try {
      await rejectPrivateSessionRequest(drizzle, { requestId: id, adminNote: body.adminNote ?? null });
      const { statusCode, payload } = successResponse({ message: "Request rejected", data: null });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof SessionPoolError) {
        const { statusCode, payload } = errorResponse({
          message: err.message,
          statusCode: err.statusCode,
          error: err.code,
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  private createGroupRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: createGroupRoomBodySchema,
    });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof createGroupRoomBodySchema>;

    try {
      const data = await createGroupRoom(drizzle, {
        instructorId: body.instructorId,
        name: body.name ?? null,
        scheduledStartUtc: new Date(body.scheduledStartUtc),
        scheduledEndUtc: new Date(body.scheduledEndUtc),
        capacity: body.capacity,
        meetLink: body.meetLink,
      });

      const { statusCode, payload } = successResponse({
        message: "Group room created",
        data,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "INSTRUCTOR_NOT_FOUND") {
        const { statusCode, payload } = errorResponse({
          message: "Instructor not found",
          statusCode: 404,
          error: "INSTRUCTOR_NOT_FOUND",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "INSTRUCTOR_BUSY") {
        const { statusCode, payload } = errorResponse({
          message: "Instructor already has a session in this time window",
          statusCode: 409,
          error: "INSTRUCTOR_BUSY",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  private updateGroupRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: roomIdParamsSchema });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, { body: updateGroupRoomBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof roomIdParamsSchema>;
    const body = request.body as z.infer<typeof updateGroupRoomBodySchema>;

    try {
      const data = await updateGroupRoom(drizzle, id, {
        instructorId: body.instructorId,
        name: body.name,
        scheduledStartUtc: body.scheduledStartUtc ? new Date(body.scheduledStartUtc) : undefined,
        scheduledEndUtc: body.scheduledEndUtc ? new Date(body.scheduledEndUtc) : undefined,
        capacity: body.capacity,
        meetLink: body.meetLink,
      });

      const { statusCode, payload } = successResponse({ message: "Group room updated", data });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "ROOM_NOT_FOUND") {
        const { statusCode, payload } = errorResponse({
          message: "Room not found",
          statusCode: 404,
          error: "ROOM_NOT_FOUND",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "ROOM_ENDED") {
        const { statusCode, payload } = errorResponse({
          message: "This class has already ended and can no longer be edited",
          statusCode: 409,
          error: "ROOM_ENDED",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "ROOM_CANCELLED") {
        const { statusCode, payload } = errorResponse({
          message: "This class has been cancelled and can no longer be edited",
          statusCode: 409,
          error: "ROOM_CANCELLED",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "CAPACITY_BELOW_OCCUPANCY") {
        const { statusCode, payload } = errorResponse({
          message: "Capacity cannot be lower than the current number of bookings",
          statusCode: 409,
          error: "CAPACITY_BELOW_OCCUPANCY",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "INSTRUCTOR_NOT_FOUND") {
        const { statusCode, payload } = errorResponse({
          message: "Instructor not found",
          statusCode: 404,
          error: "INSTRUCTOR_NOT_FOUND",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "INSTRUCTOR_BUSY") {
        const { statusCode, payload } = errorResponse({
          message: "Instructor already has a session in this time window",
          statusCode: 409,
          error: "INSTRUCTOR_BUSY",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  private cancelGroupRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: roomIdParamsSchema });
    if (invalidParams) return invalidParams;

    const { id } = request.params as z.infer<typeof roomIdParamsSchema>;

    try {
      await cancelGroupRoom(drizzle, id);
      const { statusCode, payload } = successResponse({ message: "Class cancelled", data: null });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "ROOM_NOT_FOUND") {
        const { statusCode, payload } = errorResponse({
          message: "Room not found",
          statusCode: 404,
          error: "ROOM_NOT_FOUND",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "ROOM_ENDED") {
        const { statusCode, payload } = errorResponse({
          message: "This class has already ended and can no longer be cancelled",
          statusCode: 409,
          error: "ROOM_ENDED",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "ROOM_ALREADY_CANCELLED") {
        const { statusCode, payload } = errorResponse({
          message: "This class has already been cancelled",
          statusCode: 409,
          error: "ROOM_ALREADY_CANCELLED",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };
}
