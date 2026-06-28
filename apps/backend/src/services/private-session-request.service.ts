import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import {
  instructorDetails,
  plans,
  privateSessionRequests,
  roomUsers,
  rooms,
  sessionQuotaLog,
  user,
  userSubscriptions,
} from "../schema/schema";
import { ROOM_STATUS, ROOM_TYPE } from "../constants/sessions";
import { SessionPoolError } from "./session-pool.service";

const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

// ─── User: submit a request ───────────────────────────────────────────────────

export async function createPrivateSessionRequest(
  db: AppDatabase,
  params: { userId: string; slots: Array<{ startUtc: Date; endUtc: Date }> },
): Promise<{ requestId: string }> {
  for (const slot of params.slots) {
    if (slot.startUtc.getTime() - Date.now() < MIN_ADVANCE_MS) {
      throw new SessionPoolError(
        "TOO_SOON",
        "All sessions must be scheduled at least 2 hours in advance.",
        422,
      );
    }
    if (slot.endUtc <= slot.startUtc) {
      throw new SessionPoolError("INVALID_RANGE", "End time must be after start time.", 422);
    }
  }

  const firstSlot = params.slots[0];
  const [inserted] = await db
    .insert(privateSessionRequests)
    .values({
      userId: params.userId,
      requestedStart: firstSlot.startUtc,
      requestedEnd: firstSlot.endUtc,
      preferredSlots: params.slots.map((s) => ({
        startUtc: s.startUtc.toISOString(),
        endUtc: s.endUtc.toISOString(),
      })),
    })
    .returning({ id: privateSessionRequests.id });

  return { requestId: inserted.id };
}

// ─── User: list own requests ──────────────────────────────────────────────────

export async function listMyPrivateSessionRequests(db: AppDatabase, userId: string) {
  const rows = await db
    .select({
      id: privateSessionRequests.id,
      requestedStart: privateSessionRequests.requestedStart,
      requestedEnd: privateSessionRequests.requestedEnd,
      preferredSlots: privateSessionRequests.preferredSlots,
      status: privateSessionRequests.status,
      instructorName: user.name,
      roomId: privateSessionRequests.roomId,
      adminNote: privateSessionRequests.adminNote,
      createdAt: privateSessionRequests.createdAt,
    })
    .from(privateSessionRequests)
    .leftJoin(user, eq(user.id, privateSessionRequests.instructorId))
    .where(eq(privateSessionRequests.userId, userId))
    .orderBy(desc(privateSessionRequests.createdAt));

  return rows.map((r) => ({
    ...r,
    requestedStart: r.requestedStart.toISOString(),
    requestedEnd: r.requestedEnd.toISOString(),
    preferredSlots: r.preferredSlots ?? [],
    createdAt: r.createdAt.toISOString(),
    instructorName: r.instructorName ?? null,
  }));
}

// ─── Admin: list all requests ─────────────────────────────────────────────────

export async function listAllPrivateSessionRequests(
  db: AppDatabase,
  status: "pending" | "approved" | "rejected" = "pending",
) {
  const rows = await db
    .select({
      id: privateSessionRequests.id,
      userId: privateSessionRequests.userId,
      requestedStart: privateSessionRequests.requestedStart,
      requestedEnd: privateSessionRequests.requestedEnd,
      preferredSlots: privateSessionRequests.preferredSlots,
      status: privateSessionRequests.status,
      instructorId: privateSessionRequests.instructorId,
      roomId: privateSessionRequests.roomId,
      adminNote: privateSessionRequests.adminNote,
      createdAt: privateSessionRequests.createdAt,
    })
    .from(privateSessionRequests)
    .where(eq(privateSessionRequests.status, status))
    .orderBy(desc(privateSessionRequests.createdAt));

  if (rows.length === 0) return [];

  const userIds = [...new Set(rows.map((r) => r.userId))];
  const instructorIds = [...new Set(rows.map((r) => r.instructorId).filter(Boolean) as string[])];

  const userRows = userIds.length
    ? await db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .where(inArray(user.id, userIds))
    : [];

  const instructorRows = instructorIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, instructorIds))
    : [];

  const userMap = new Map(userRows.map((u) => [u.id, u]));
  const instrMap = new Map(instructorRows.map((u) => [u.id, u]));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: userMap.get(r.userId)?.name ?? "Unknown",
    userEmail: userMap.get(r.userId)?.email ?? "",
    requestedStart: r.requestedStart.toISOString(),
    requestedEnd: r.requestedEnd.toISOString(),
    preferredSlots: r.preferredSlots ?? [],
    status: r.status as "pending" | "approved" | "rejected",
    instructorId: r.instructorId ?? null,
    instructorName: r.instructorId ? (instrMap.get(r.instructorId)?.name ?? null) : null,
    roomId: r.roomId ?? null,
    adminNote: r.adminNote ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ─── Admin: assign instructor + approve ──────────────────────────────────────

export async function assignPrivateSessionRequest(
  db: AppDatabase,
  params: { requestId: string; instructorId: string; adminNote?: string | null },
): Promise<{ roomIds: string[] }> {
  return db.transaction(async (trx) => {
    const [req] = await trx
      .select()
      .from(privateSessionRequests)
      .where(eq(privateSessionRequests.id, params.requestId))
      .limit(1);

    if (!req) {
      throw new SessionPoolError("NOT_FOUND", "Private session request not found", 404);
    }
    if (req.status !== "pending") {
      throw new SessionPoolError(
        "ALREADY_PROCESSED",
        `Request is already ${req.status}`,
        409,
      );
    }

    // All slots to create rooms for — fall back to the primary slot for legacy requests
    const slots: Array<{ startUtc: Date; endUtc: Date }> =
      req.preferredSlots && req.preferredSlots.length > 0
        ? req.preferredSlots.map((s) => ({
            startUtc: new Date(s.startUtc),
            endUtc: new Date(s.endUtc),
          }))
        : [{ startUtc: req.requestedStart, endUtc: req.requestedEnd }];

    const slotCount = slots.length;

    // Check instructor exists and is approved
    const [instructor] = await trx
      .select({ isApproved: instructorDetails.isApproved })
      .from(instructorDetails)
      .where(eq(instructorDetails.userId, params.instructorId));

    if (!instructor?.isApproved) {
      throw new SessionPoolError("INSTRUCTOR_NOT_FOUND", "Instructor not found or not approved", 404);
    }

    // Check instructor has no conflicts across all slots
    for (const slot of slots) {
      const conflict = await trx.execute(sql`
        SELECT 1 FROM "rooms"
        WHERE "instructor_id" = ${params.instructorId}
          AND "status" <> ${ROOM_STATUS.ENDED}
          AND tstzrange("scheduled_start", "scheduled_end") &&
              tstzrange(${slot.startUtc.toISOString()}::timestamptz, ${slot.endUtc.toISOString()}::timestamptz)
        LIMIT 1
      `);
      const conflictRows =
        (conflict as unknown as { rows?: unknown[] }).rows ??
        (conflict as unknown as unknown[]);
      if ((conflictRows as unknown[]).length > 0) {
        throw new SessionPoolError(
          "INSTRUCTOR_BUSY",
          `Instructor already has a session during ${slot.startUtc.toISOString()}`,
          409,
        );
      }
    }

    // Fetch and lock user subscription — must have enough sessions for all slots
    const lockedSubRows = await trx.execute(sql`
      SELECT us.id, us.sessions_total, us.sessions_used, p.allows_private, p.billing_interval
      FROM "user_subscriptions" us
      JOIN "plans" p ON p.id = us.plan_id
      WHERE us.user_id = ${req.userId}
        AND us.status = 'active'
        AND (us.expires_at IS NULL OR us.expires_at > now())
        AND us.sessions_total IS NOT NULL
        AND us.sessions_used < us.sessions_total
      ORDER BY us.purchased_at DESC
      LIMIT 1
      FOR UPDATE OF us
    `);
    const lockedRows =
      (lockedSubRows as unknown as { rows?: unknown[] }).rows ??
      (lockedSubRows as unknown[]);
    const subRow = (lockedRows as Record<string, unknown>[])[0] ?? null;

    if (!subRow) {
      throw new SessionPoolError("NO_ACTIVE_PLAN", "User does not have an active plan with available sessions", 403);
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
        "User's plan does not include private 1:1 sessions",
        403,
      );
    }

    const remaining = sub.sessionsTotal - sub.sessionsUsed;
    if (remaining < slotCount) {
      throw new SessionPoolError(
        "QUOTA_EXCEEDED",
        `User needs ${slotCount} session${slotCount > 1 ? "s" : ""} but only has ${remaining} remaining`,
        429,
      );
    }

    // Create one private room per slot
    const createdRoomIds: string[] = [];
    for (const slot of slots) {
      const [created] = await trx
        .insert(rooms)
        .values({
          type: ROOM_TYPE.PRIVATE,
          status: ROOM_STATUS.IDLE,
          instructorId: params.instructorId,
          capacity: 2,
          scheduledStart: slot.startUtc,
          scheduledEnd: slot.endUtc,
        })
        .returning();

      await trx.insert(roomUsers).values({ roomId: created.id, userId: req.userId });

      await trx.execute(sql`
        INSERT INTO "session_quota_log" ("user_id", "room_id", "week_start", "billing_interval")
        VALUES (
          ${req.userId},
          ${created.id},
          date_trunc('month', now())::date,
          ${sub.billingInterval}
        )
        ON CONFLICT ("user_id", "week_start", "room_id") DO NOTHING
      `);

      createdRoomIds.push(created.id);
    }

    // Deduct all sessions at once
    const newUsed = sub.sessionsUsed + slotCount;
    await trx
      .update(userSubscriptions)
      .set({
        sessionsUsed: newUsed,
        status: newUsed >= sub.sessionsTotal ? "expired" : "active",
      })
      .where(eq(userSubscriptions.id, sub.id));

    // Update request to approved — store first room id for backwards compat
    await trx
      .update(privateSessionRequests)
      .set({
        status: "approved",
        instructorId: params.instructorId,
        roomId: createdRoomIds[0],
        adminNote: params.adminNote ?? null,
        updatedAt: new Date(),
      })
      .where(eq(privateSessionRequests.id, params.requestId));

    return { roomIds: createdRoomIds };
  });
}

// ─── Admin: reject ────────────────────────────────────────────────────────────

export async function rejectPrivateSessionRequest(
  db: AppDatabase,
  params: { requestId: string; adminNote?: string | null },
): Promise<void> {
  const [req] = await db
    .select({ status: privateSessionRequests.status })
    .from(privateSessionRequests)
    .where(eq(privateSessionRequests.id, params.requestId))
    .limit(1);

  if (!req) {
    throw new SessionPoolError("NOT_FOUND", "Private session request not found", 404);
  }
  if (req.status !== "pending") {
    throw new SessionPoolError("ALREADY_PROCESSED", `Request is already ${req.status}`, 409);
  }

  await db
    .update(privateSessionRequests)
    .set({
      status: "rejected",
      adminNote: params.adminNote ?? null,
      updatedAt: new Date(),
    })
    .where(eq(privateSessionRequests.id, params.requestId));
}
