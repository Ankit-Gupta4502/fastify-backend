import { and, asc, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { user, plans, rooms, instructorDetails, userSubscriptions, userPreferences, userAcquisition } from "../schema/schema";
import { auth } from "../lib/auth";
import { USER_ROLES } from "../constants/roles";
import { createHmsRoom } from "./hms.service";
import { ROOM_STATUS, ROOM_TYPE } from "../constants/sessions";
import { notifyEligibleGroupUsers } from "./room-notification.service";

export async function listUsers(db: AppDatabase) {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  const activeSubs = await db
    .select({ userId: userSubscriptions.userId, planName: plans.name })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .where(
      and(
        eq(userSubscriptions.status, "active"),
        or(isNull(userSubscriptions.sessionsTotal), lt(userSubscriptions.sessionsUsed, userSubscriptions.sessionsTotal)),
      ),
    );

  const prefs = await db
    .select({
      userId: userPreferences.userId,
      gender: userPreferences.gender,
      phone: userPreferences.phone,
      purposes: userPreferences.purposes,
      otherPurpose: userPreferences.otherPurpose,
      preferredTimeOfDay: userPreferences.preferredTimeOfDay,
      timezone: userPreferences.timezone,
    })
    .from(userPreferences);

  const acquisitions = await db
    .select({
      userId: userAcquisition.userId,
      utmSource: userAcquisition.utmSource,
      utmMedium: userAcquisition.utmMedium,
      utmCampaign: userAcquisition.utmCampaign,
      referrer: userAcquisition.referrer,
      landingPage: userAcquisition.landingPage,
    })
    .from(userAcquisition);

  const planNameByUser = new Map<string, string>();
  for (const sub of activeSubs) {
    if (!planNameByUser.has(sub.userId)) planNameByUser.set(sub.userId, sub.planName);
  }
  const prefsByUser = new Map(prefs.map((p) => [p.userId, p]));
  const acqByUser = new Map(acquisitions.map((a) => [a.userId, a]));

  return users.map((u) => ({
    ...u,
    planName: planNameByUser.get(u.id) ?? null,
    createdAt: u.createdAt.toISOString(),
    preferences: prefsByUser.get(u.id) ?? null,
    acquisition: acqByUser.get(u.id) ?? null,
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
      sortOrder: instructorDetails.sortOrder,
    })
    .from(instructorDetails)
    .innerJoin(user, eq(instructorDetails.userId, user.id))
    .orderBy(asc(instructorDetails.sortOrder), asc(user.name));

  return rows.map((r) => ({
    ...r,
    specialty: r.specialty ?? [],
    maxConcurrentSessions: r.maxConcurrentSessions ?? 1,
    sortOrder: r.sortOrder ?? 0,
  }));
}

export async function createInstructor(
  db: AppDatabase,
  { name, email, password }: { name: string; email: string; password: string },
) {
  const result = await auth.api.signUpEmail({
    body: { name, email, password, role: USER_ROLES.INSTRUCTOR },
    headers: new Headers(),
  });

  // better-auth returns { user, session, token } — shape is guaranteed by the library
  const newUser = (result as unknown as { user: { id: string; name: string; email: string } }).user;

  await db.insert(instructorDetails).values({ userId: newUser.id });

  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

export async function updateInstructorPriority(
  db: AppDatabase,
  instructorId: string,
  sortOrder: number,
) {
  const [updated] = await db
    .update(instructorDetails)
    .set({ sortOrder })
    .where(eq(instructorDetails.userId, instructorId))
    .returning();

  return updated ?? null;
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
      meetLink: rooms.meetLink,
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
    meetLink?: string | null;
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
      meetLink: params.meetLink ?? null,
      hmsRoomId: hms.hmsRoomId,
      hmsRoomCode: hms.hmsRoomCode,
    })
    .returning();

  // Fire-and-forget: notify eligible group-plan users about the new class
  notifyEligibleGroupUsers(db, inserted.id, {
    scheduledStart: params.scheduledStartUtc,
    instructorId: params.instructorId,
    instructorName: instructor?.name ?? "your instructor",
    meetLink: params.meetLink ?? null,
  }).catch((err) => console.error("group room notification failed", err));

  return { roomId: inserted.id };
}
