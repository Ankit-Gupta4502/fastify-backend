import { desc, eq, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { user, plans, rooms, instructorDetails } from "../schema/schema";
import { createHmsRoom } from "./hms.service";
import { ROOM_STATUS, ROOM_TYPE } from "../constants/sessions";
import { notifyEligibleGroupUsers } from "./room-notification.service";

export async function listUsers(db: AppDatabase) {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      planName: plans.name,
      createdAt: user.createdAt,
    })
    .from(user)
    .leftJoin(plans, eq(user.planId, plans.id))
    .orderBy(desc(user.createdAt));

  return rows.map((r) => ({
    ...r,
    planName: r.planName ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function listInstructors(db: AppDatabase) {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      status: instructorDetails.status,
      specialty: instructorDetails.specialty,
      maxConcurrentSessions: instructorDetails.maxConcurrentSessions,
      isApproved: instructorDetails.isApproved,
    })
    .from(instructorDetails)
    .innerJoin(user, eq(instructorDetails.userId, user.id))
    .orderBy(user.name);

  return rows.map((r) => ({
    ...r,
    specialty: r.specialty ?? [],
    maxConcurrentSessions: r.maxConcurrentSessions ?? 1,
  }));
}

export async function approveInstructor(
  db: AppDatabase,
  instructorId: string,
  approve: boolean,
) {
  const [updated] = await db
    .update(instructorDetails)
    .set({ isApproved: approve })
    .where(eq(instructorDetails.userId, instructorId))
    .returning();

  return updated ?? null;
}

export async function listGroupRooms(db: AppDatabase) {
  const rows = await db
    .select({
      id: rooms.id,
      instructorId: rooms.instructorId,
      instructorName: user.name,
      scheduledStart: rooms.scheduledStart,
      scheduledEnd: rooms.scheduledEnd,
      capacity: rooms.capacity,
      currentOccupancy: rooms.currentOccupancy,
      status: rooms.status,
    })
    .from(rooms)
    .innerJoin(user, eq(rooms.instructorId, user.id))
    .where(eq(rooms.type, ROOM_TYPE.GROUP))
    .orderBy(desc(rooms.scheduledStart));

  return rows.map((r) => ({
    ...r,
    scheduledStart: r.scheduledStart.toISOString(),
    scheduledEnd: r.scheduledEnd.toISOString(),
  }));
}

export async function createGroupRoom(
  db: AppDatabase,
  params: {
    instructorId: string;
    scheduledStartUtc: Date;
    scheduledEndUtc: Date;
    capacity: number;
  },
) {
  const [instructor] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, params.instructorId));

  if (!instructor) {
    throw new Error("INSTRUCTOR_NOT_FOUND");
  }

  const conflict = await db.execute(sql`
    SELECT 1 FROM "rooms"
    WHERE "instructor_id" = ${params.instructorId}
      AND "status" <> ${ROOM_STATUS.ENDED}
      AND tstzrange("scheduled_start", "scheduled_end") &&
          tstzrange(${params.scheduledStartUtc.toISOString()}::timestamptz,
                    ${params.scheduledEndUtc.toISOString()}::timestamptz)
    LIMIT 1
  `);
  const conflictRows =
    (conflict as unknown as { rows?: unknown[] }).rows ??
    (conflict as unknown as unknown[]);
  if ((conflictRows as unknown[]).length > 0) {
    throw new Error("INSTRUCTOR_BUSY");
  }

  const hms = await createHmsRoom(false);

  const [inserted] = await db
    .insert(rooms)
    .values({
      type: ROOM_TYPE.GROUP,
      status: ROOM_STATUS.IDLE,
      instructorId: params.instructorId,
      capacity: params.capacity,
      scheduledStart: params.scheduledStartUtc,
      scheduledEnd: params.scheduledEndUtc,
      hmsRoomId: hms.hmsRoomId,
      hmsRoomCode: hms.hmsRoomCode,
    })
    .returning();

  // Fire-and-forget: notify eligible group-plan users about the new class
  notifyEligibleGroupUsers(db, inserted.id, {
    scheduledStart: params.scheduledStartUtc,
    instructorId: params.instructorId,
    instructorName: instructor?.name ?? "your instructor",
  }).catch((err) => console.error("group room notification failed", err));

  return { roomId: inserted.id };
}
