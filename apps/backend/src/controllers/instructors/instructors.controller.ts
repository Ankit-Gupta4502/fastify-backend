import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, arrayContains, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { ROOM_STATUS } from "../../constants/sessions";

const LIVE_JOIN_WINDOW_MS = 15 * 60 * 1000;
import { drizzle } from "../../db";
import {
  instructorDetails,
  instructorWallet,
  privateSessionRequests,
  rooms,
  user,
  walletTransaction,
} from "../../schema/schema";
import { formatForInstructor } from "../../services/timezone.service";
import {
  instructorsSwaggerSchemas,
  listInstructorsQuerySchema,
  updateInstructorAvailabilityBodySchema,
  updateInstructorProfileBodySchema,
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

        router.get(
          "/instructor/:id/profile",
          {},
          this.getInstructorProfile,
        );

        router.get(
          "/instructor/profile",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.INSTRUCTOR),
            ],
          },
          this.getProfile,
        );

        router.put(
          "/instructor/profile",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.INSTRUCTOR),
            ],
          },
          this.updateProfile,
        );

        router.put(
          "/instructor/availability",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.INSTRUCTOR),
            ],
          },
          this.updateAvailability,
        );

        router.get(
          "/instructor/wallet",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.INSTRUCTOR),
            ],
          },
          this.getWallet,
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

    const conditions = [
      eq(user.role, USER_ROLES.INSTRUCTOR),
      eq(instructorDetails.isApproved, true),
    ];
    if (query.status) {
      conditions.push(eq(instructorDetails.status, query.status));
    }
    if (query.specialty) {
      conditions.push(arrayContains(instructorDetails.tags, [query.specialty]));
    }

    const rows = await drizzle
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        status: instructorDetails.status,
        specialty: instructorDetails.tags,
        currentRoomId: instructorDetails.currentRoomId,
        profileImageUrl: instructorDetails.profileImageUrl,
        tagline: instructorDetails.tagline,
        yearsOfExperience: instructorDetails.yearsOfExperience,
        rating: instructorDetails.rating,
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
        meetLink: rooms.meetLink,
        adminNote: privateSessionRequests.adminNote,
      })
      .from(rooms)
      .leftJoin(privateSessionRequests, eq(privateSessionRequests.roomId, rooms.id))
      .where(
        and(
          eq(rooms.instructorId, me.id),
          inArray(rooms.status, [
            ROOM_STATUS.IDLE,
            ROOM_STATUS.ACTIVE,
            ROOM_STATUS.FULL,
            ROOM_STATUS.CANCELLED,
          ]),
        ),
      )
      .orderBy(rooms.scheduledStart);

    const serverNow = Date.now();
    const data = rows.map((r) => {
      const canJoinFrom = r.scheduledStartUtc.getTime() - LIVE_JOIN_WINDOW_MS;
      const canJoinLive =
        r.status !== ROOM_STATUS.CANCELLED &&
        serverNow >= canJoinFrom &&
        serverNow < r.scheduledEndUtc.getTime();
      const isExpired = serverNow >= r.scheduledEndUtc.getTime();
      return {
        ...r,
        scheduledStart: formatForInstructor(r.scheduledStartUtc),
        scheduledEnd: formatForInstructor(r.scheduledEndUtc),
        canJoinLive,
        isExpired,
        isCancelled: r.status === ROOM_STATUS.CANCELLED,
      };
    });

    const { statusCode, payload } = successResponse({
      message: "Your upcoming schedule (IST)",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  private getInstructorProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const [row] = await drizzle
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        status: instructorDetails.status,
        specialty: instructorDetails.specialty,
        currentRoomId: instructorDetails.currentRoomId,
        bio: instructorDetails.bio,
        tagline: instructorDetails.tagline,
        profileImageUrl: instructorDetails.profileImageUrl,
        avatarKey: instructorDetails.avatarKey,
        introVideoUrl: instructorDetails.introVideoUrl,
        tags: instructorDetails.tags,
        yearsOfExperience: instructorDetails.yearsOfExperience,
        rating: instructorDetails.rating,
        studentsGuided: instructorDetails.studentsGuided,
      })
      .from(instructorDetails)
      .innerJoin(user, eq(instructorDetails.userId, user.id))
      .where(
        and(
          eq(instructorDetails.userId, id),
          eq(user.role, USER_ROLES.INSTRUCTOR),
          eq(instructorDetails.isApproved, true),
        ),
      );

    if (!row) {
      const { statusCode, payload } = errorResponse({ message: "Instructor not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({ message: "Instructor profile", data: row });
    return reply.status(statusCode).send(payload);
  };

  private getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user!;

    const [row] = await drizzle
      .select({
        name: user.name,
        email: user.email,
        image: user.image,
        bio: instructorDetails.bio,
        tagline: instructorDetails.tagline,
        profileImageUrl: instructorDetails.profileImageUrl,
        avatarKey: instructorDetails.avatarKey,
        introVideoUrl: instructorDetails.introVideoUrl,
        introVideoKey: instructorDetails.introVideoKey,
        tags: instructorDetails.tags,
        yearsOfExperience: instructorDetails.yearsOfExperience,
        specialty: instructorDetails.specialty,
        status: instructorDetails.status,
        availability: instructorDetails.availabilityJson,
        availabilityUpdatedAt: instructorDetails.availabilityUpdatedAt,
      })
      .from(instructorDetails)
      .innerJoin(user, eq(instructorDetails.userId, user.id))
      .where(eq(instructorDetails.userId, me.id));

    if (!row) {
      const { statusCode, payload } = errorResponse({ message: "Profile not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Profile",
      data: {
        ...row,
        availability: row.availability ?? [],
        availabilityUpdatedAt: row.availabilityUpdatedAt?.toISOString() ?? null,
      },
    });
    return reply.status(statusCode).send(payload);
  };

  private updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user!;

    const invalid = validateWithZod(request, reply, { body: updateInstructorProfileBodySchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof updateInstructorProfileBodySchema>;

    await Promise.all([
      body.name !== undefined
        ? drizzle.update(user).set({ name: body.name }).where(eq(user.id, me.id))
        : Promise.resolve(),
      drizzle
        .update(instructorDetails)
        .set({
          ...(body.bio !== undefined && { bio: body.bio }),
          ...(body.tagline !== undefined && { tagline: body.tagline }),
          ...(body.profileImageUrl !== undefined && { profileImageUrl: body.profileImageUrl }),
          ...(body.avatarKey !== undefined && { avatarKey: body.avatarKey }),
          ...(body.introVideoUrl !== undefined && { introVideoUrl: body.introVideoUrl }),
          ...(body.introVideoKey !== undefined && { introVideoKey: body.introVideoKey }),
          ...(body.tags !== undefined && { tags: body.tags }),
          ...(body.yearsOfExperience !== undefined && { yearsOfExperience: body.yearsOfExperience }),
        })
        .where(eq(instructorDetails.userId, me.id)),
    ]);

    const { statusCode, payload } = successResponse({ message: "Profile updated", data: null });
    return reply.status(statusCode).send(payload);
  };

  private updateAvailability = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user!;

    const invalid = validateWithZod(request, reply, { body: updateInstructorAvailabilityBodySchema });
    if (invalid) return invalid;

    const { availability } = request.body as z.infer<typeof updateInstructorAvailabilityBodySchema>;

    await drizzle
      .update(instructorDetails)
      .set({ availabilityJson: availability, availabilityUpdatedAt: new Date() })
      .where(eq(instructorDetails.userId, me.id));

    const { statusCode, payload } = successResponse({ message: "Availability updated", data: null });
    return reply.status(statusCode).send(payload);
  };

  private getWallet = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user!;

    const [wallet] = await drizzle
      .select({ id: instructorWallet.id, balancePaise: instructorWallet.balancePaise })
      .from(instructorWallet)
      .where(eq(instructorWallet.instructorId, me.id));

    const transactions = wallet
      ? await drizzle
          .select({
            id: walletTransaction.id,
            amountPaise: walletTransaction.amountPaise,
            type: walletTransaction.type,
            description: walletTransaction.description,
            roomId: walletTransaction.roomId,
            createdAt: walletTransaction.createdAt,
          })
          .from(walletTransaction)
          .where(eq(walletTransaction.walletId, wallet.id))
          .orderBy(desc(walletTransaction.createdAt))
          .limit(50)
      : [];

    const balancePaise = wallet?.balancePaise ?? 0;

    const { statusCode, payload } = successResponse({
      message: "Wallet",
      data: {
        balancePaise,
        balanceInr: balancePaise / 100,
        transactions,
      },
    });
    return reply.status(statusCode).send(payload);
  };
}
