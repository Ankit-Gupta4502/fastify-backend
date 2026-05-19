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
import { formatForAudience } from "./timezone.service";

const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;   // private booking: 2 h before
const LIVE_JOIN_WINDOW_MS = 15 * 60 * 1000;   // can enter live room 15 min before start

export class SessionPoolError extends Error {
  statusCode: number;
  code: string;
  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ─── List upcoming group rooms ────────────────────────────────────────────────

export type UpcomingRoom = {
  id: string;
  status: string;
  capacity: number;
  currentOccupancy: number;
  spotsLeft: number;
  scheduledStart: string;
  scheduledStartUtc: Date;
  scheduledEndUtc: Date;
  isEnrolled: boolean;
  instructor: {
    id: string;
    name: string;
    specialty: string[];
  };
};

export async function listUpcomingGroupRooms(
  db: AppDatabase,
  audience: { role: string; timezone: string; userId?: string },
): Promise<UpcomingRoom[]> {
  const rows = await db
    .select({
      id: rooms.id,
      status: rooms.status,
      capacity: rooms.capacity,
      currentOccupancy: rooms.currentOccupancy,
      scheduledStartUtc: rooms.scheduledStart,
      scheduledEndUtc: rooms.scheduledEnd,
      instructorId: user.id,
      instructorName: user.name,
      specialty: instructorDetails.specialty,
      enrolledUserId: roomUsers.userId,
    })
    .from(rooms)
    .innerJoin(user, eq(rooms.instructorId, user.id))
    .leftJoin(instructorDetails, eq(instructorDetails.userId, user.id))
    .leftJoin(
      roomUsers,
      and(
        eq(roomUsers.roomId, rooms.id),
        audience.userId
          ? eq(roomUsers.userId, audience.userId)
          : sql`false`,
        sql`${roomUsers.leftAt} IS NULL`,
      ),
    )
    .where(
      and(
        eq(rooms.type, ROOM_TYPE.GROUP),
        // include idle, active, and full — full rooms still shown to enrolled users
        inArray(rooms.status, [ROOM_STATUS.IDLE, ROOM_STATUS.ACTIVE, ROOM_STATUS.FULL]),
        // show until the session ends, not just until it starts
        gt(rooms.scheduledEnd, new Date()),
      ),
    )
    .orderBy(rooms.scheduledStart)
    .limit(20);

  const serverNow = Date.now();

  return rows.map((r) => {
    const canJoinFrom = r.scheduledStartUtc.getTime() - LIVE_JOIN_WINDOW_MS;
    const canJoinLive = serverNow >= canJoinFrom && serverNow < r.scheduledEndUtc.getTime();

    return {
      id: r.id,
      status: r.status,
      capacity: r.capacity,
      currentOccupancy: r.currentOccupancy,
      spotsLeft: r.capacity - r.currentOccupancy,
      scheduledStartUtc: r.scheduledStartUtc,
      scheduledEndUtc: r.scheduledEndUtc,
      scheduledStart: formatForAudience(r.scheduledStartUtc, audience),
      isEnrolled: r.enrolledUserId !== null,
      canJoinLive,
      instructor: {
        id: r.instructorId,
        name: r.instructorName,
        specialty: r.specialty ?? [],
      },
    };
  });
}

// ─── Enrol (reserve spot) ─────────────────────────────────────────────────────

export type EnrolRoomResult = {
  roomId: string;
};

export async function enrollRoom(
  db: AppDatabase,
  params: { userId: string; roomId: string },
): Promise<EnrolRoomResult> {
  return db.transaction(async (trx) => {
    // 1. Quota check
    const [quota] = await trx
      .select({
        billingInterval: plans.billingInterval,
        usedWeek: user.sessionsUsedThisWeek,
        limitWeek: plans.sessionsPerWeek,
        usedMonth: user.sessionsUsedThisMonth,
        limitMonth: plans.sessionsPerMonth,
      })
      .from(user)
      .leftJoin(plans, eq(user.planId, plans.id))
      .where(eq(user.id, params.userId));

    if (!quota) {
      throw new SessionPoolError("USER_NOT_FOUND", "User not found", 404);
    }
    // Bug 3: users with no active plan have null billingInterval (LEFT JOIN miss)
    if (!quota.billingInterval) {
      throw new SessionPoolError("NO_ACTIVE_PLAN", "An active plan is required to book sessions", 403);
    }

    const isMonthly = quota.billingInterval === "month";

    // Bug 6: enrollRoom is group-rooms-only — monthly plans are for private sessions
    if (isMonthly) {
      throw new SessionPoolError("PLAN_NOT_ALLOWED", "Your plan does not include group live sessions", 403);
    }

    const used = quota.usedWeek ?? 0;
    const limit = quota.limitWeek;
    if (limit !== null && used >= limit) {
      throw new SessionPoolError("QUOTA_EXCEEDED", "Weekly session quota exceeded", 429);
    }

    // 2. Guard against double enrolment
    const [existing] = await trx
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

    if (existing) {
      throw new SessionPoolError("ALREADY_ENROLLED", "Already enrolled in this session", 409);
    }

    // 3. Lock the room — reject if full, ended, or past scheduled end
    const locked = await trx.execute(sql`
      SELECT "id", "capacity", "current_occupancy"
      FROM "rooms"
      WHERE "id" = ${params.roomId}
        AND "type" = ${ROOM_TYPE.GROUP}
        AND "status" IN (${ROOM_STATUS.IDLE}, ${ROOM_STATUS.ACTIVE})
        AND "current_occupancy" < "capacity"
        AND "scheduled_end" > now()
      FOR UPDATE SKIP LOCKED
    `);
    const lockedRows =
      (locked as unknown as { rows?: unknown[] }).rows ??
      (locked as unknown as unknown[]);

    if ((lockedRows as unknown[]).length === 0) {
      throw new SessionPoolError(
        "ROOM_UNAVAILABLE",
        "Room is full, ended, or no longer accepting enrolments",
        409,
      );
    }

    // 4. Reserve the spot — increment occupancy and flip to FULL if last slot taken
    await trx.execute(sql`
      UPDATE "rooms"
      SET
        "current_occupancy" = "current_occupancy" + 1,
        "status" = CASE
          WHEN "current_occupancy" + 1 >= "capacity" THEN ${ROOM_STATUS.FULL}
          ELSE "status"
        END
      WHERE "id" = ${params.roomId}
    `);

    // 5. Record the booking
    await trx.insert(roomUsers).values({
      roomId: params.roomId,
      userId: params.userId,
    });

    // 6. Deduct from weekly quota (Bug 6 ensures only weekly plans reach here)
    await trx
      .update(user)
      .set({ sessionsUsedThisWeek: sql`${user.sessionsUsedThisWeek} + 1` })
      .where(eq(user.id, params.userId));

    // 7. Idempotent quota log — Bug 2: store billingInterval so leaveRoom
    // can restore the correct counter even after a plan change.
    await trx.execute(sql`
      INSERT INTO "session_quota_log" ("user_id", "room_id", "week_start", "billing_interval")
      VALUES (${params.userId}, ${params.roomId}, date_trunc('week', now())::date, ${quota.billingInterval})
      ON CONFLICT ("user_id", "week_start", "room_id") DO NOTHING
    `);

    return { roomId: params.roomId };
  });
}

// ─── Enter live room (requires prior enrolment + time window) ─────────────────

export type EnterLiveResult = {
  roomId: string;
  hmsRoomCode: string | null;
};

export async function enterLiveRoom(
  db: AppDatabase,
  params: { userId: string; roomId: string },
): Promise<EnterLiveResult> {
  return db.transaction(async (trx) => {
    // 1. Fetch room details and enforce time window
    const [room] = await trx
      .select({
        status: rooms.status,
        scheduledStart: rooms.scheduledStart,
        scheduledEnd: rooms.scheduledEnd,
        hmsRoomCode: rooms.hmsRoomCode,
        instructorId: rooms.instructorId,
      })
      .from(rooms)
      .where(eq(rooms.id, params.roomId));

    if (!room) {
      throw new SessionPoolError("ROOM_NOT_FOUND", "Room not found", 404);
    }

    const now = Date.now();
    const canJoinFrom = room.scheduledStart.getTime() - LIVE_JOIN_WINDOW_MS;

    if (now < canJoinFrom) {
      const minsLeft = Math.ceil((canJoinFrom - now) / 60_000);
      throw new SessionPoolError(
        "TOO_EARLY",
        `Session hasn't started yet. You can join ${minsLeft} minute${minsLeft !== 1 ? "s" : ""} before it begins.`,
        422,
      );
    }

    if (now > room.scheduledEnd.getTime()) {
      throw new SessionPoolError("SESSION_ENDED", "This session has ended", 410);
    }

    // 2. Access check — instructors own their room; users must be enrolled
    const isRoomInstructor = room.instructorId === params.userId;

    if (!isRoomInstructor) {
      // Accept active enrolment OR a dropped record (reconnect after disconnect/late join)
      const [booking] = await trx
        .select({ id: roomUsers.id, leftAt: roomUsers.leftAt })
        .from(roomUsers)
        .where(
          and(
            eq(roomUsers.roomId, params.roomId),
            eq(roomUsers.userId, params.userId),
          ),
        )
        .orderBy(sql`${roomUsers.leftAt} IS NULL DESC`)  // prefer the active record
        .limit(1);

      if (!booking) {
        throw new SessionPoolError(
          "NOT_ENROLLED",
          "You must enrol in this session before joining",
          403,
        );
      }

      // Reconnect path: session has started and user's record was marked dropped on disconnect
      if (booking.leftAt !== null) {
        if (now < room.scheduledStart.getTime()) {
          // Session hasn't started yet — don't accept a stale dropped record
          throw new SessionPoolError(
            "NOT_ENROLLED",
            "You must enrol in this session before joining",
            403,
          );
        }
        // Restore the booking so isEnrolled continues to show correctly
        await trx
          .update(roomUsers)
          .set({ leftAt: null, status: BOOKING_STATUS.ACTIVE })
          .where(eq(roomUsers.id, booking.id));
        // Occupancy is NOT incremented — the spot was never freed on a mid-session disconnect
      }
    }

    // 3. Flip status to active on first live entry
    if (room.status === ROOM_STATUS.IDLE) {
      await trx
        .update(rooms)
        .set({ status: ROOM_STATUS.ACTIVE })
        .where(eq(rooms.id, params.roomId));
    }

    return { roomId: params.roomId, hmsRoomCode: room.hmsRoomCode };
  });
}

// ─── Leave / unenrol ─────────────────────────────────────────────────────────

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
        "NOT_ENROLLED",
        "You are not enrolled in this session",
        404,
      );
    }

    // Fetch scheduledStart to decide whether to free the spot
    const [roomRow] = await trx
      .select({ scheduledStart: rooms.scheduledStart })
      .from(rooms)
      .where(eq(rooms.id, params.roomId));

    const leftAt = new Date();
    await trx
      .update(roomUsers)
      .set({ leftAt, status: BOOKING_STATUS.DROPPED })
      .where(eq(roomUsers.id, active.id));

    // Free the spot only if the session hasn't started yet (pre-session cancellation).
    // Mid-session disconnects keep the slot reserved so the user can reconnect.
    const sessionStarted = roomRow && roomRow.scheduledStart.getTime() <= Date.now();
    if (!sessionStarted) {
      // Decrement occupancy and transition FULL → ACTIVE if a spot just opened
      await trx.execute(sql`
        UPDATE "rooms"
        SET
          "current_occupancy" = GREATEST("current_occupancy" - 1, 0),
          "status" = CASE
            WHEN "status" = ${ROOM_STATUS.FULL} THEN ${ROOM_STATUS.ACTIVE}
            ELSE "status"
          END
        WHERE "id" = ${params.roomId}
      `);

      // Bug 2: read billingInterval from the log row written at enrolment time,
      // not from the user's current plan. Atomically marks the row uncounted and
      // returns the interval — single round-trip, no stale-plan risk.
      const [logRow] = await trx
        .update(sessionQuotaLog)
        .set({ counted: false })
        .where(
          and(
            eq(sessionQuotaLog.userId, params.userId),
            eq(sessionQuotaLog.roomId, params.roomId),
            eq(sessionQuotaLog.counted, true),
          ),
        )
        .returning();

      if (logRow) {
        await trx
          .update(user)
          .set(
            logRow.billingInterval === "month"
              ? { sessionsUsedThisMonth: sql`GREATEST(${user.sessionsUsedThisMonth} - 1, 0)` }
              : { sessionsUsedThisWeek: sql`GREATEST(${user.sessionsUsedThisWeek} - 1, 0)` },
          )
          .where(eq(user.id, params.userId));
      }
    }

    return { roomId: params.roomId, leftAt };
  });
}

// ─── Book private session (premium plans only) ────────────────────────────────

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

    // 2. Verify user has a plan that allows private sessions and has quota remaining
    const [userPlan] = await trx
      .select({
        allowsPrivate: plans.allowsPrivate,
        billingInterval: plans.billingInterval,
        usedWeek: user.sessionsUsedThisWeek,
        limitWeek: plans.sessionsPerWeek,
        usedMonth: user.sessionsUsedThisMonth,
        limitMonth: plans.sessionsPerMonth,
      })
      .from(user)
      .leftJoin(plans, eq(user.planId, plans.id))
      .where(eq(user.id, params.userId));

    if (!userPlan) {
      throw new SessionPoolError("USER_NOT_FOUND", "User not found", 404);
    }
    // Bug 3: users with no active plan have null billingInterval (LEFT JOIN miss)
    if (!userPlan.billingInterval) {
      throw new SessionPoolError("NO_ACTIVE_PLAN", "An active plan is required to book sessions", 403);
    }
    if (!userPlan.allowsPrivate) {
      throw new SessionPoolError(
        "PLAN_NOT_ALLOWED",
        "Your plan does not include private 1:1 sessions. Please upgrade to a premium plan.",
        403,
      );
    }

    const pvtMonthly = userPlan.billingInterval === "month";
    const pvtUsed = pvtMonthly ? (userPlan.usedMonth ?? 0) : (userPlan.usedWeek ?? 0);
    const pvtLimit = pvtMonthly ? userPlan.limitMonth : userPlan.limitWeek;
    if (pvtLimit !== null && pvtUsed >= pvtLimit) {
      throw new SessionPoolError(
        "QUOTA_EXCEEDED",
        pvtMonthly ? "Monthly session quota exceeded" : "Weekly session quota exceeded",
        429,
      );
    }

    // 3. Verify instructor is approved
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

    // 4. Reject overlapping bookings for this instructor
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

    // 5. Create the private room
    const [created] = await trx
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

    // 6. Record the user booking
    await trx.insert(roomUsers).values({
      roomId: created.id,
      userId: params.userId,
    });

    // 7. Deduct from the right quota counter
    await trx
      .update(user)
      .set(
        pvtMonthly
          ? { sessionsUsedThisMonth: sql`${user.sessionsUsedThisMonth} + 1` }
          : { sessionsUsedThisWeek: sql`${user.sessionsUsedThisWeek} + 1` },
      )
      .where(eq(user.id, params.userId));

    // 8. Idempotent quota log — Bug 2+4: store billing_interval and correct period start
    const pvtPeriodTrunc = pvtMonthly ? "month" : "week";
    await trx.execute(sql`
      INSERT INTO "session_quota_log" ("user_id", "room_id", "week_start", "billing_interval")
      VALUES (
        ${params.userId},
        ${created.id},
        date_trunc(${pvtPeriodTrunc}, now())::date,
        ${userPlan.billingInterval}
      )
      ON CONFLICT ("user_id", "week_start", "room_id") DO NOTHING
    `);

    return { roomId: created.id };
  });
}
