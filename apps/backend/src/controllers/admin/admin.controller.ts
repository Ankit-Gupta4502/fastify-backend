import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import {
  listUsers,
  listInstructors,
  listGroupRooms,
  createGroupRoom,
  approveInstructor,
  createInstructor,
  updateInstructorPriority,
} from "../../services/admin.service";

const approveInstructorBodySchema = z.object({
  approve: z.boolean(),
});

const updatePriorityBodySchema = z.object({
  sortOrder: z.number().int().min(0),
});

const createInstructorBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const instructorIdParamsSchema = z.object({
  id: z.string().uuid("Invalid instructor id"),
});

const createGroupRoomBodySchema = z
  .object({
    instructorId: z.string().uuid(),
    scheduledStartUtc: z.string().datetime(),
    scheduledEndUtc: z.string().datetime(),
    capacity: z.number().int().min(2).max(50).default(20),
    meetLink: z.string().url().optional().nullable(),
  })
  .refine((v) => new Date(v.scheduledEndUtc) > new Date(v.scheduledStartUtc), {
    message: "scheduledEndUtc must be after scheduledStartUtc",
    path: ["scheduledEndUtc"],
  })
  .refine((v) => new Date(v.scheduledStartUtc) > new Date(), {
    message: "scheduledStartUtc must be in the future",
    path: ["scheduledStartUtc"],
  });

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
        router.get("/instructors", { preHandler }, this.getInstructors);
        router.post("/instructors", { preHandler }, this.createInstructor);
        router.patch("/instructors/:id/approve", { preHandler }, this.approveInstructor);
        router.patch("/instructors/:id/priority", { preHandler }, this.updatePriority);
        router.get("/rooms/group", { preHandler }, this.getGroupRooms);
        router.post("/rooms/group", { preHandler }, this.createGroupRoom);
      },
      { prefix: "/admin" },
    );
  }

  private getUsers = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await listUsers(drizzle);
    const { statusCode, payload } = successResponse({ message: "Users", data });
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

  private getGroupRooms = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await listGroupRooms(drizzle);
    const { statusCode, payload } = successResponse({ message: "Group rooms", data });
    return reply.status(statusCode).send(payload);
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
        scheduledStartUtc: new Date(body.scheduledStartUtc),
        scheduledEndUtc: new Date(body.scheduledEndUtc),
        capacity: body.capacity,
        meetLink: body.meetLink ?? null,
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
}
