import { and, desc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import {
  instructorDetails,
  plans,
  roomUsers,
  rooms,
  sessionQuotaLog,
  user,
  userSubscriptions,
} from "../schema/schema";
import {
  BOOKING_STATUS,
  ROOM_STATUS,
  ROOM_TYPE,
} from "../constants/sessions";
import { formatForAudience } from "./timezone.service";
import { createHmsRoom } from "./hms.service";

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

// ─── Helper: fetch active subscription ───────────────────────────────────────

async function getActiveSubscription(db: AppDatabase, userId: string) {
  const [sub] = await db
    .select({
      id: userSubscriptions.id,
      planId: userSubscriptions.planId,
      sessionsTotal: userSubscriptions.sessionsTotal,
      sessionsUsed: userSubscriptions.sessionsUsed,
      allowsPrivate: plans.allowsPrivate,
      billingInterval: plans.billingInterval,
      sessionsPerWeek: plans.sessionsPerWeek,
    })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, "active"),
        or(
          isNull(userSubscriptions.expiresAt),
          gt(userSubscriptions.expiresAt, new Date()),
        ),
        or(
          isNull(userSubscriptions.sessionsTotal),
          lt(userSubscriptions.sessionsUsed, userSubscriptions.sessionsTotal),
        ),
      ),
    )
    .orderBy(desc(userSubscriptions.purchasedAt))
    .limit(1);

  return sub ?? null;
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
  meetLink: string | null;
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
      meetLink: rooms.meetLink,
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
        inArray(rooms.status, [ROOM_STATUS.IDLE, ROOM_STATUS.ACTIVE, ROOM_STATUS.FULL]),
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
      meetLink: r.enrolledUserId !== null ? (r.meetLink ?? null) : null,
      instructor: {
        id: r.instructorId,
        name: r.instructorName,
        specialty: r.specialty ?? [],
      },
    };
  });
}

// ─── Enrol (reserve spot in group room) ──────────────────────────────────────

export type EnrolRoomResult = {
  roomId: string;
};

export async function enrollRoom(
  db: AppDatabase,
  params: { userId: string; roomId: string; userRole?: string },
): Promise<EnrolRoomResult> {
  return db.transaction(async (trx) => {
    const isPrivilegedRole = params.userRole === "instructor" || params.userRole === "admin";
    let subBillingInterval = "week";

    // 1. Subscription + quota check — skipped for instructors/admins attending as observers.
    if (!isPrivilegedRole) {
      const sub = await getActiveSubscription(trx as AppDatabase, params.userId);

      if (!sub) {
        throw new SessionPoolError("NO_ACTIVE_PLAN", "An active plan is required to book sessions", 403);
      }

      // Group rooms require weekly (non-private) plans
      if (sub.billingInterval === "month" || sub.allowsPrivate) {
        throw new SessionPoolError("PLAN_NOT_ALLOWED", "Your plan does not include group live sessions", 403);
      }

      // 2. Weekly quota check (group plans use the user-level weekly counter)
      const [quotaRow] = await trx
        .select({
          usedWeek: user.sessionsUsedThisWeek,
        })
        .from(user)
        .where(eq(user.id, params.userId));

      const used = quotaRow?.usedWeek ?? 0;
      const limit = sub.sessionsPerWeek;
      if (limit !== null && used >= limit) {
        throw new SessionPoolError("QUOTA_EXCEEDED", "Weekly session quota exceeded", 429);
      }

      subBillingInterval = sub.billingInterval;
    }

    // 3. Guard against double enrolment
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

    // 4. Lock the room
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

    // 5. Reserve the spot
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

    // 6. Record the booking
    await trx.insert(roomUsers).values({
      roomId: params.roomId,
      userId: params.userId,
    });

    // 7-8. Quota deduction and logging — skipped for instructors/admins (no subscription).
    if (!isPrivilegedRole) {
      await trx
        .update(user)
        .set({ sessionsUsedThisWeek: sql`${user.sessionsUsedThisWeek} + 1` })
        .where(eq(user.id, params.userId));

      await trx.execute(sql`
        INSERT INTO "session_quota_log" ("user_id", "room_id", "week_start", "billing_interval")
        VALUES (${params.userId}, ${params.roomId}, date_trunc('week', now())::date, ${subBillingInterval})
        ON CONFLICT ("user_id", "week_start", "room_id") DO NOTHING
      `);
    }

    return { roomId: params.roomId };
  });
}

// ─── Enter live room ──────────────────────────────────────────────────────────

export type EnterLiveResult = {
  roomId: string;
  hmsRoomCode: string | null;
};

export async function enterLiveRoom(
  db: AppDatabase,
  params: { userId: string; roomId: string },
): Promise<EnterLiveResult> {
  return db.transaction(async (trx) => {
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

    const isRoomInstructor = room.instructorId === params.userId;

    if (!isRoomInstructor) {
      const [booking] = await trx
        .select({ id: roomUsers.id, leftAt: roomUsers.leftAt })
        .from(roomUsers)
        .where(
          and(
            eq(roomUsers.roomId, params.roomId),
            eq(roomUsers.userId, params.userId),
          ),
        )
        .orderBy(sql`${roomUsers.leftAt} IS NULL DESC`)
        .limit(1);

      if (!booking) {
        throw new SessionPoolError(
          "NOT_ENROLLED",
          "You must enrol in this session before joining",
          403,
        );
      }

      if (booking.leftAt !== null) {
        if (now < room.scheduledStart.getTime()) {
          throw new SessionPoolError(
            "NOT_ENROLLED",
            "You must enrol in this session before joining",
            403,
          );
        }
        await trx
          .update(roomUsers)
          .set({ leftAt: null, status: BOOKING_STATUS.ACTIVE })
          .where(eq(roomUsers.id, booking.id));
      }
    }

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

    const [roomRow] = await trx
      .select({ scheduledStart: rooms.scheduledStart })
      .from(rooms)
      .where(eq(rooms.id, params.roomId));

    const leftAt = new Date();
    await trx
      .update(roomUsers)
      .set({ leftAt, status: BOOKING_STATUS.DROPPED })
      .where(eq(roomUsers.id, active.id));

    const sessionStarted = roomRow && roomRow.scheduledStart.getTime() <= Date.now();
    if (!sessionStarted) {
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
        if (logRow.billingInterval === "month") {
          // Private/session-pool plans: restore sessionsUsed on the subscription row.
          // Use the room's scheduledStart as a timestamp anchor so we restore to the
          // subscription that was actually active when the booking was made, not the
          // most recently purchased one (which may be a different plan bought later).
          await trx.execute(sql`
            UPDATE "user_subscriptions"
            SET "sessions_used" = GREATEST("sessions_used" - 1, 0),
                "status" = CASE
                  WHEN "status" = 'expired' THEN 'active'
                  ELSE "status"
                END
            WHERE "id" = (
              SELECT us.id FROM "user_subscriptions" us
              JOIN "plans" p ON p.id = us.plan_id
              JOIN "rooms" r ON r.id = ${params.roomId}
              WHERE us.user_id = ${params.userId}
                AND p.billing_interval = 'month'
                AND us.status IN ('active', 'expired')
                AND us.purchased_at <= r.scheduled_start
              ORDER BY us.purchased_at DESC
              LIMIT 1
            )
          `);
        } else {
          await trx
            .update(user)
            .set({ sessionsUsedThisWeek: sql`GREATEST(${user.sessionsUsedThisWeek} - 1, 0)` })
            .where(eq(user.id, params.userId));
        }
      }
    }

    return { roomId: params.roomId, leftAt };
  });
}

// ─── Book private session ─────────────────────────────────────────────────────

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

    // 2. Lock the active subscription row to prevent double-booking races.
    // SELECT … FOR UPDATE ensures only one concurrent transaction can read
    // and modify this row at a time.
    const lockedSubRows = await trx.execute(sql`
      SELECT us.id, us.sessions_total, us.sessions_used, p.allows_private, p.billing_interval
      FROM "user_subscriptions" us
      JOIN "plans" p ON p.id = us.plan_id
      WHERE us.user_id = ${params.userId}
        AND us.status = 'active'
        AND (us.expires_at IS NULL OR us.expires_at > now())
        AND us.sessions_total IS NOT NULL
        AND us.sessions_used < us.sessions_total
      ORDER BY us.purchased_at DESC
      LIMIT 1
      FOR UPDATE OF us
    `);
    const lockedRows = (lockedSubRows as unknown as { rows?: unknown[] }).rows ?? (lockedSubRows as unknown[]);
    const subRow = (lockedRows as Record<string, unknown>[])[0] ?? null;

    if (!subRow) {
      throw new SessionPoolError("NO_ACTIVE_PLAN", "An active plan is required to book sessions", 403);
    }

    const sub = {
      id: subRow.id as string,
      sessionsTotal: subRow.sessions_total as number,
      sessionsUsed: subRow.sessions_used as number,
      allowsPrivate: subRow.allows_private as boolean,
      billingInterval: subRow.billing_interval as string,
    };

    if (!sub.allowsPrivate) {
      throw new SessionPoolError(
        "PLAN_NOT_ALLOWED",
        "Your plan does not include private 1:1 sessions. Please upgrade to a premium plan.",
        403,
      );
    }

    const remaining = sub.sessionsTotal - sub.sessionsUsed;
    if (remaining <= 0) {
      throw new SessionPoolError(
        "QUOTA_EXCEEDED",
        "You have used all sessions in your current plan. Please purchase a new plan.",
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
    const hms = await createHmsRoom(true);

    const [created] = await trx
      .insert(rooms)
      .values({
        type: ROOM_TYPE.PRIVATE,
        status: ROOM_STATUS.IDLE,
        instructorId: params.instructorId,
        capacity: 2,
        scheduledStart: params.startUtc,
        scheduledEnd: params.endUtc,
        hmsRoomId: hms.hmsRoomId,
        hmsRoomCode: hms.hmsRoomCode,
      })
      .returning();

    // 6. Record the user booking
    await trx.insert(roomUsers).values({
      roomId: created.id,
      userId: params.userId,
    });

    // 7. Deduct from the subscription's session pool
    const newUsed = sub.sessionsUsed + 1;
    await trx
      .update(userSubscriptions)
      .set({
        sessionsUsed: newUsed,
        // Auto-expire when the last session is consumed
        status: newUsed >= sub.sessionsTotal ? "expired" : "active",
      })
      .where(eq(userSubscriptions.id, sub.id));

    // 8. Quota log (billing_interval frozen for leave-room restore compatibility)
    await trx.execute(sql`
      INSERT INTO "session_quota_log" ("user_id", "room_id", "week_start", "billing_interval")
      VALUES (
        ${params.userId},
        ${created.id},
        date_trunc('month', now())::date,
        ${sub.billingInterval}
      )
      ON CONFLICT ("user_id", "week_start", "room_id") DO NOTHING
    `);

    return { roomId: created.id };
  });
}
