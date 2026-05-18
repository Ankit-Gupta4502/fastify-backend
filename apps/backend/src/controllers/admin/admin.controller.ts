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
} from "../../services/admin.service";

const approveInstructorBodySchema = z.object({
  approve: z.boolean(),
});

const createGroupRoomBodySchema = z.object({
  instructorId: z.string().uuid(),
  scheduledStartUtc: z.string().datetime(),
  scheduledEndUtc: z.string().datetime(),
  capacity: z.number().int().min(2).max(50).default(20),
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
        router.patch("/instructors/:id/approve", { preHandler }, this.approveInstructor);
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
    const invalid = validateWithZod(request, reply, { body: approveInstructorBodySchema });
    if (invalid) return invalid;

    const { id } = request.params as { id: string };
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

    const data = await createGroupRoom(drizzle, {
      instructorId: body.instructorId,
      scheduledStartUtc: new Date(body.scheduledStartUtc),
      scheduledEndUtc: new Date(body.scheduledEndUtc),
      capacity: body.capacity,
    });

    const { statusCode, payload } = successResponse({
      message: "Group room created",
      data,
      statusCode: 201,
    });
    return reply.status(statusCode).send(payload);
  };
}
