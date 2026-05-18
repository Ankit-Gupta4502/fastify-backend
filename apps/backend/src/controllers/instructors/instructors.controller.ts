import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, arrayContains, eq, gt, inArray } from "drizzle-orm";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { ROOM_STATUS } from "../../constants/sessions";
import { drizzle } from "../../db";
import { instructorDetails, rooms, user } from "../../schema/schema";
import { formatForInstructor } from "../../services/timezone.service";
import {
  instructorsSwaggerSchemas,
  listInstructorsQuerySchema,
} from "../../validation/instructors.validation.schema";
import { errorResponse, successResponse, validateWithZod } from "../../utils";

export class InstructorsController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.get(
          "/instructors",
          {
            preHandler: this.authMiddleware.handle,
            schema: instructorsSwaggerSchemas.list,
          },
          this.listInstructors,
        );

        router.get(
          "/instructor/schedule",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.INSTRUCTOR),
            ],
            schema: instructorsSwaggerSchemas.mySchedule,
          },
          this.mySchedule,
        );
      },
      { prefix: "/" },
    );
  }

  private listInstructors = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      query: listInstructorsQuerySchema,
    });
    if (invalid) return invalid;

    const query = request.query as z.infer<typeof listInstructorsQuerySchema>;

    const conditions = [eq(user.role, USER_ROLES.INSTRUCTOR)];
    if (query.status) {
      conditions.push(eq(instructorDetails.status, query.status));
    }
    if (query.specialty) {
      conditions.push(arrayContains(instructorDetails.specialty, [query.specialty]));
    }

    const rows = await drizzle
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        status: instructorDetails.status,
        specialty: instructorDetails.specialty,
        currentRoomId: instructorDetails.currentRoomId,
      })
      .from(user)
      .innerJoin(instructorDetails, eq(instructorDetails.userId, user.id))
      .where(and(...conditions));

    const { statusCode, payload } = successResponse({
      message: "Instructors",
      data: rows,
    });
    return reply.status(statusCode).send(payload);
  };

  private mySchedule = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const rows = await drizzle
      .select({
        id: rooms.id,
        type: rooms.type,
        status: rooms.status,
        capacity: rooms.capacity,
        currentOccupancy: rooms.currentOccupancy,
        scheduledStartUtc: rooms.scheduledStart,
        scheduledEndUtc: rooms.scheduledEnd,
      })
      .from(rooms)
      .where(
        and(
          eq(rooms.instructorId, me.id),
          inArray(rooms.status, [
            ROOM_STATUS.IDLE,
            ROOM_STATUS.ACTIVE,
            ROOM_STATUS.FULL,
          ]),
          gt(rooms.scheduledEnd, new Date()),
        ),
      )
      .orderBy(rooms.scheduledStart);

    const data = rows.map((r) => ({
      ...r,
      scheduledStart: formatForInstructor(r.scheduledStartUtc),
      scheduledEnd: formatForInstructor(r.scheduledEndUtc),
    }));

    const { statusCode, payload } = successResponse({
      message: "Your upcoming schedule (IST)",
      data,
    });
    return reply.status(statusCode).send(payload);
  };
}
