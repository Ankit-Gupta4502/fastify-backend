import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { DEFAULT_USER_TIMEZONE } from "../../constants/sessions";
import { drizzle } from "../../db";
import {
  bookPrivateSession,
  enrollRoom,
  enterLiveRoom,
  leaveRoom,
  listUpcomingGroupRooms,
  SessionPoolError,
} from "../../services/session-pool.service";
import {
  privateBookingBodySchema,
  roomIdParamsSchema,
  roomsSwaggerSchemas,
} from "../../validation/rooms.validation.schema";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import { sendBookingConfirmationEmails } from "../../services/booking-email.service";

export class RoomsController {
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
          "/group/upcoming",
          {
            preHandler: this.authMiddleware.handle,
            schema: roomsSwaggerSchemas.listUpcomingGroup,
          },
          this.listUpcomingGroup,
        );

        router.post(
          "/:id/enrol",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN),
            ],
            schema: roomsSwaggerSchemas.enrol,
          },
          this.enrolRoom,
        );

        router.post(
          "/:id/join",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN),
            ],
            schema: roomsSwaggerSchemas.join,
          },
          this.joinLive,
        );

        router.post(
          "/:id/leave",
          {
            preHandler: this.authMiddleware.handle,
            schema: roomsSwaggerSchemas.leave,
          },
          this.leaveRoom,
        );

        router.post(
          "/private/book",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN),
            ],
            schema: roomsSwaggerSchemas.privateBook,
          },
          this.bookPrivate,
        );
      },
      { prefix: "/rooms" },
    );
  }

  private listUpcomingGroup = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const timezone = (me as { timezone?: string }).timezone || DEFAULT_USER_TIMEZONE;
    const data = await listUpcomingGroupRooms(drizzle, {
      role: me.role,
      timezone,
      userId: me.id,
    });

    const { statusCode, payload } = successResponse({ message: "Upcoming group rooms", data });
    return reply.status(statusCode).send(payload);
  };

  private enrolRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { params: roomIdParamsSchema });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const { id: roomId } = request.params as z.infer<typeof roomIdParamsSchema>;

    try {
      const result = await enrollRoom(drizzle, { userId: me.id, roomId });

      // Fire-and-forget confirmation email
      sendBookingConfirmationEmails({
        userId: me.id,
        userName: me.name,
        userEmail: me.email,
        roomId,
      }).catch((err: unknown) =>
        request.log.error({ err }, "enrolment email failed"),
      );

      const { statusCode, payload } = successResponse({
        message: "Enrolled in session",
        data: result,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private joinLive = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { params: roomIdParamsSchema });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const { id: roomId } = request.params as z.infer<typeof roomIdParamsSchema>;

    try {
      const result = await enterLiveRoom(drizzle, { userId: me.id, roomId });

      const { statusCode, payload } = successResponse({
        message: "Joined room",
        data: {
          roomId: result.roomId,
          hmsRoomCode: result.hmsRoomCode,
        },
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private leaveRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { params: roomIdParamsSchema });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const { id: roomId } = request.params as z.infer<typeof roomIdParamsSchema>;

    try {
      const result = await leaveRoom(drizzle, { userId: me.id, roomId });
      const { statusCode, payload } = successResponse({ message: "Left session", data: result });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private bookPrivate = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: privateBookingBodySchema });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof privateBookingBodySchema>;

    try {
      const result = await bookPrivateSession(drizzle, {
        userId: me.id,
        instructorId: body.instructorId,
        startUtc: new Date(body.startUtc),
        endUtc: new Date(body.endUtc),
      });

      sendBookingConfirmationEmails({
        userId: me.id,
        userName: me.name,
        userEmail: me.email,
        roomId: result.roomId,
      }).catch((err: unknown) =>
        request.log.error({ err }, "private booking email failed"),
      );

      const { statusCode, payload } = successResponse({
        message: "Private session booked",
        data: result,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private handleSessionPoolError(err: unknown, reply: FastifyReply) {
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
}
