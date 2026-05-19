import { and, eq, gt, inArray, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import {
  instructorDetails,
  plans,
  roomUsers,
  rooms,
  sessionQuotaLog,
  user,
} from "../schema/schema";
import {
  BOOKING_STATUS,
  ROOM_STATUS,
  ROOM_TYPE,
} from "../constants/sessions";

const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000; // 2 hours
import { formatForAudience } from "./timezone.service";

export class SessionPoolError extends Error {
  statusCode: number;
  code: string;
  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export type UpcomingRoom = {
  id: string;
  status: string;
  capacity: number;
  currentOccupancy: number;
  spotsLeft: number;
  scheduledStart: string;
  scheduledStartUtc: Date;
  instructor: {
    id: string;
    name: string;
    specialty: string[];
  };
};

export async function listUpcomingGroupRooms(
  db: AppDatabase,
  audience: { role: string; timezone: string },
): Promise<UpcomingRoom[]> {
  const rows = await db
    .select({
      id: rooms.id,
      status: rooms.status,
      capacity: rooms.capacity,
      currentOccupancy: rooms.currentOccupancy,
      scheduledStartUtc: rooms.scheduledStart,
      instructorId: user.id,
      instructorName: user.name,
      specialty: instructorDetails.specialty,
    })
    .from(rooms)
    .innerJoin(user, eq(rooms.instructorId, user.id))
    .leftJoin(instructorDetails, eq(instructorDetails.userId, user.id))
    .where(
      and(
        eq(rooms.type, ROOM_TYPE.GROUP),
        inArray(rooms.status, [ROOM_STATUS.IDLE, ROOM_STATUS.ACTIVE]),
        gt(rooms.scheduledStart, new Date()),
      ),
    )
    .orderBy(rooms.scheduledStart)
    .limit(20);

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    capacity: r.capacity,
    currentOccupancy: r.currentOccupancy,
    spotsLeft: r.capacity - r.currentOccupancy,
    scheduledStartUtc: r.scheduledStartUtc,
    scheduledStart: formatForAudience(r.scheduledStartUtc, audience),
    instructor: {
      id: r.instructorId,
      name: r.instructorName,
      specialty: r.specialty ?? [],
    },
  }));
}

export type JoinRoomResult = {
  roomId: string;
  hmsRoomId: string | null;
};

export async function joinRoom(
  db: AppDatabase,
  params: { userId: string; roomId: string },
): Promise<JoinRoomResult> {
  return db.transaction(async (trx) => {
    // 1. Quota check
    const [quota] = await trx
      .select({
        used: user.sessionsUsedThisWeek,
        limit: plans.sessionsPerWeek,
      })
      .from(user)
      .leftJoin(plans, eq(user.planId, plans.id))
      .where(eq(user.id, params.userId));

    if (!quota) {
      throw new SessionPoolError("USER_NOT_FOUND", "User not found", 404);
    }
    if (quota.limit !== null && (quota.used ?? 0) >= quota.limit) {
      throw new SessionPoolError(
        "QUOTA_EXCEEDED",
        "Weekly session quota exceeded",
        429,
      );
    }

    // 2. Lock the room row (raw SQL — FOR UPDATE SKIP LOCKED isn't in Drizzle's QB)
    const locked = await trx.execute(sql`
      SELECT "id", "status", "hms_room_id", "capacity", "current_occupancy"
      FROM "rooms"
      WHERE "id" = ${params.roomId}
        AND "type" = ${ROOM_TYPE.GROUP}
        AND "status" IN (${ROOM_STATUS.IDLE}, ${ROOM_STATUS.ACTIVE})
        AND "current_occupancy" < "capacity"
      FOR UPDATE SKIP LOCKED
    `);
    const lockedRows =
      (locked as unknown as { rows?: unknown[] }).rows ??
      (locked as unknown as unknown[]);
    const room = (lockedRows as Array<{
      id: string;
      status: string;
      hms_room_id: string | null;
      capacity: number;
      current_occupancy: number;
    }>)[0];

    if (!room) {
      throw new SessionPoolError(
        "ROOM_UNAVAILABLE",
        "Room is full or no longer joinable",
        409,
      );
    }

    // 3. Bump occupancy; flip idle -> active
    const nextStatus =
      room.status === ROOM_STATUS.IDLE ? ROOM_STATUS.ACTIVE : room.status;
    await trx
      .update(rooms)
      .set({
        currentOccupancy: sql`${rooms.currentOccupancy} + 1`,
        status: nextStatus,
      })
      .where(eq(rooms.id, params.roomId));

    // 4. Record the booking
    await trx.insert(roomUsers).values({
      roomId: params.roomId,
      userId: params.userId,
    });

    // 5. Denormalised counter
    await trx
      .update(user)
      .set({
        sessionsUsedThisWeek: sql`${user.sessionsUsedThisWeek} + 1`,
      })
      .where(eq(user.id, params.userId));

    // 6. Idempotent quota log
    await trx.execute(sql`
      INSERT INTO "session_quota_log" ("user_id", "room_id", "week_start")
      VALUES (${params.userId}, ${params.roomId}, date_trunc('week', now())::date)
      ON CONFLICT ("user_id", "week_start", "room_id") DO NOTHING
    `);

    return { roomId: params.roomId, hmsRoomId: room.hms_room_id };
  });
}

export type LeaveRoomResult = {
  roomId: string;
  leftAt: Date;
};

export async function leaveRoom(
  db: AppDatabase,
  params: { userId: string; roomId: string },
): Promise<LeaveRoomResult> {
  return db.transaction(async (trx) => {
    const [active] = await trx
      .select({ id: roomUsers.id })
      .from(roomUsers)
      .where(
        and(
          eq(roomUsers.roomId, params.roomId),
          eq(roomUsers.userId, params.userId),
          sql`${roomUsers.leftAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!active) {
      throw new SessionPoolError(
        "NOT_IN_ROOM",
        "You are not currently in this room",
        404,
      );
    }

    const leftAt = new Date();
    await trx
      .update(roomUsers)
      .set({ leftAt, status: BOOKING_STATUS.DROPPED })
      .where(eq(roomUsers.id, active.id));

    await trx
      .update(rooms)
      .set({
        currentOccupancy: sql`GREATEST(${rooms.currentOccupancy} - 1, 0)`,
      })
      .where(eq(rooms.id, params.roomId));

    return { roomId: params.roomId, leftAt };
  });
}

export type BookPrivateParams = {
  userId: string;
  instructorId: string;
  startUtc: Date;
  endUtc: Date;
};

export async function bookPrivateSession(
  db: AppDatabase,
  params: BookPrivateParams,
): Promise<{ roomId: string }> {
  return db.transaction(async (trx) => {
    // 1. Enforce 2-hour advance booking window
    if (params.startUtc.getTime() - Date.now() < MIN_ADVANCE_MS) {
      throw new SessionPoolError(
        "TOO_SOON",
        "Sessions must be scheduled at least 2 hours in advance.",
        422,
      );
    }

    // 2. Verify user has a plan that allows private sessions
    const [userPlan] = await trx
      .select({ allowsPrivate: plans.allowsPrivate })
      .from(user)
      .leftJoin(plans, eq(user.planId, plans.id))
      .where(eq(user.id, params.userId));

    if (!userPlan) {
      throw new SessionPoolError("USER_NOT_FOUND", "User not found", 404);
    }
    if (!userPlan.allowsPrivate) {
      throw new SessionPoolError(
        "PLAN_NOT_ALLOWED",
        "Your plan does not include private 1:1 sessions. Please upgrade to a premium plan.",
        403,
      );
    }

    // 3. Verify instructor is approved (status is not tracked in real-time)
    const [instructor] = await trx
      .select({ isApproved: instructorDetails.isApproved })
      .from(instructorDetails)
      .where(eq(instructorDetails.userId, params.instructorId));

    if (!instructor?.isApproved) {
      throw new SessionPoolError(
        "INSTRUCTOR_NOT_FOUND",
        "Instructor not found or not available for booking",
        404,
      );
    }

    // 4. Reject overlapping bookings for this instructor at the requested time
    const conflict = await trx.execute(sql`
      SELECT 1 FROM "rooms"
      WHERE "instructor_id" = ${params.instructorId}
        AND "status" <> ${ROOM_STATUS.ENDED}
        AND tstzrange("scheduled_start", "scheduled_end") &&
            tstzrange(${params.startUtc.toISOString()}::timestamptz, ${params.endUtc.toISOString()}::timestamptz)
      LIMIT 1
    `);
    const conflictRows =
      (conflict as unknown as { rows?: unknown[] }).rows ??
      (conflict as unknown as unknown[]);
    if ((conflictRows as unknown[]).length > 0) {
      throw new SessionPoolError(
        "INSTRUCTOR_BUSY",
        "Instructor already has a session in this time window",
        409,
      );
    }

    // 4. Create the private room
    const inserted = await trx
      .insert(rooms)
      .values({
        type: ROOM_TYPE.PRIVATE,
        status: ROOM_STATUS.IDLE,
        instructorId: params.instructorId,
        capacity: 2,
        scheduledStart: params.startUtc,
        scheduledEnd: params.endUtc,
      })
      .returning();
    const created = inserted[0];

    // 5. Record the user booking
    await trx.insert(roomUsers).values({
      roomId: created.id,
      userId: params.userId,
    });

    return { roomId: created.id };
  });
}
