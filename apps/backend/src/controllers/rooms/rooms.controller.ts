import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { and, eq, gt, inArray } from "drizzle-orm";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { DEFAULT_USER_TIMEZONE, ROOM_STATUS, ROOM_TYPE } from "../../constants/sessions";
import { drizzle } from "../../db";
import { rooms, user, instructorDetails } from "../../schema/schema";
import {
  bookPrivateSession,
  enrollRoom,
  enterLiveRoom,
  leaveRoom,
  listUpcomingGroupRooms,
  SessionPoolError,
} from "../../services/session-pool.service";
import {
  createPrivateSessionRequest,
  listMyPrivateSessionRequests,
} from "../../services/private-session-request.service";
import {
  privateBookingBodySchema,
  requestPrivateBodySchema,
  roomIdParamsSchema,
  roomsSwaggerSchemas,
} from "../../validation/rooms.validation.schema";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import { sendBookingConfirmationEmails } from "../../services/booking-email.service";

const LIVE_JOIN_WINDOW_MS = 15 * 60 * 1000;

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
        // Public — no auth required, safe for homepage
        router.get("/public/preview", {}, this.listPublicPreview);

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

        router.post(
          "/private/request",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN),
            ],
          },
          this.requestPrivate,
        );

        router.get(
          "/private/my-requests",
          { preHandler: this.authMiddleware.handle },
          this.myPrivateRequests,
        );
      },
      { prefix: "/rooms" },
    );
  }

  private listPublicPreview = async (
    _request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const now = new Date();

    const rows = await drizzle
      .select({
        id: rooms.id,
        status: rooms.status,
        capacity: rooms.capacity,
        currentOccupancy: rooms.currentOccupancy,
        scheduledStartUtc: rooms.scheduledStart,
        scheduledEndUtc: rooms.scheduledEnd,
        instructorName: user.name,
        instructorSpecialty: instructorDetails.specialty,
      })
      .from(rooms)
      .innerJoin(user, eq(rooms.instructorId, user.id))
      .innerJoin(instructorDetails, eq(rooms.instructorId, instructorDetails.userId))
      .where(
        and(
          eq(rooms.type, ROOM_TYPE.GROUP),
          inArray(rooms.status, [ROOM_STATUS.IDLE, ROOM_STATUS.ACTIVE]),
          gt(rooms.scheduledStart, now),
        ),
      )
      .orderBy(rooms.scheduledStart)
      .limit(5);

    const data = rows.map((r) => {
      const start = new Date(r.scheduledStartUtc);
      const canJoinLive = now.getTime() >= start.getTime() - LIVE_JOIN_WINDOW_MS;
      return {
        id: r.id,
        status: r.status,
        capacity: r.capacity,
        currentOccupancy: r.currentOccupancy,
        spotsLeft: Math.max(0, r.capacity - r.currentOccupancy),
        scheduledStartUtc: r.scheduledStartUtc,
        scheduledEndUtc: r.scheduledEndUtc,
        canJoinLive,
        instructor: {
          name: r.instructorName,
          specialty: r.instructorSpecialty ?? [],
        },
      };
    });

    const { statusCode, payload } = successResponse({ message: "Public room preview", data });
    return reply.status(statusCode).send(payload);
  };

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
      const result = await enrollRoom(drizzle, { userId: me.id, roomId, userRole: me.role });

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

  private requestPrivate = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: requestPrivateBodySchema });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof requestPrivateBodySchema>;

    try {
      const result = await createPrivateSessionRequest(drizzle, {
        userId: me.id,
        requestedStartUtc: new Date(body.requestedStartUtc),
        requestedEndUtc: new Date(body.requestedEndUtc),
      });
      const { statusCode, payload } = successResponse({
        message: "Private session request submitted",
        data: result,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      return this.handleSessionPoolError(err, reply);
    }
  };

  private myPrivateRequests = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const data = await listMyPrivateSessionRequests(drizzle, me.id);
    const { statusCode, payload } = successResponse({ message: "Your private session requests", data });
    return reply.status(statusCode).send(payload);
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
