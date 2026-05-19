import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { DEFAULT_USER_TIMEZONE } from "../../constants/sessions";
import { drizzle } from "../../db";
import {
  bookPrivateSession,
  joinRoom,
  leaveRoom,
  listUpcomingGroupRooms,
  SessionPoolError,
} from "../../services/session-pool.service";
import { generateClientToken } from "../../services/hms.service";
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
          "/:id/join",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN),
            ],
            schema: roomsSwaggerSchemas.join,
          },
          this.joinGroupRoom,
        );

        router.post(
          "/:id/leave",
          {
            preHandler: this.authMiddleware.handle,
            schema: roomsSwaggerSchemas.leave,
          },
          this.leaveGroupRoom,
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
    const user = request.user;
    if (!user) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const timezone =
      (user as { timezone?: string }).timezone || DEFAULT_USER_TIMEZONE;
    const data = await listUpcomingGroupRooms(drizzle, {
      role: user.role,
      timezone,
    });

    const { statusCode, payload } = successResponse({
      message: "Upcoming group rooms",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  private joinGroupRoom = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      params: roomIdParamsSchema,
    });
    if (invalid) return invalid;

    const user = request.user;
    if (!user) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const { id: roomId } = request.params as z.infer<typeof roomIdParamsSchema>;

    try {
      const result = await joinRoom(drizzle, { userId: user.id, roomId });

      const clientToken = result.hmsRoomId
        ? generateClientToken({
            hmsRoomId: result.hmsRoomId,
            userId: user.id,
            audience: "user",
          })
        : null;

      // Fire-and-forget: email failures must not block the join response
      sendBookingConfirmationEmails({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        roomId,
      }).catch((err: unknown) =>
        request.log.error({ err }, "booking email failed"),
      );

      const { statusCode, payload } = successResponse({
        message: "Joined room",
        data: {
          roomId: result.roomId,
          hmsRoomId: result.hmsRoomId,
          hmsClientToken: clientToken,
        },
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private leaveGroupRoom = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      params: roomIdParamsSchema,
    });
    if (invalid) return invalid;

    const user = request.user;
    if (!user) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const { id: roomId } = request.params as z.infer<typeof roomIdParamsSchema>;

    try {
      const result = await leaveRoom(drizzle, { userId: user.id, roomId });
      const { statusCode, payload } = successResponse({
        message: "Left room",
        data: result,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private bookPrivate = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      body: privateBookingBodySchema,
    });
    if (invalid) return invalid;

    const user = request.user;
    if (!user) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof privateBookingBodySchema>;

    try {
      const result = await bookPrivateSession(drizzle, {
        userId: user.id,
        instructorId: body.instructorId,
        startUtc: new Date(body.startUtc),
        endUtc: new Date(body.endUtc),
      });

      // Fire-and-forget: notify both student and instructor
      sendBookingConfirmationEmails({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
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
