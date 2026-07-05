import { and, asc, desc, eq, ilike, inArray, isNull, lt, or, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { user, plans, rooms, roomUsers, instructorDetails, userSubscriptions, userPreferences, userAcquisition, privateSessionRequests } from "../schema/schema";
import { auth } from "../lib/auth";
import { USER_ROLES } from "../constants/roles";
import { ROOM_STATUS, ROOM_TYPE } from "../constants/sessions";
import { notifyEligibleGroupUsers } from "./room-notification.service";

export async function listUsers(db: AppDatabase, search?: string, role?: string, plan?: string) {
  let planUserIds: string[] | undefined;
  if (plan) {
    const planRows = await db
      .select({ userId: userSubscriptions.userId })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(
        and(
          eq(plans.name, plan),
          eq(userSubscriptions.status, "active"),
          or(isNull(userSubscriptions.sessionsTotal), lt(userSubscriptions.sessionsUsed, userSubscriptions.sessionsTotal)),
        ),
      );
    planUserIds = planRows.map((r) => r.userId);
    if (planUserIds.length === 0) return [];
  }

  const whereClause = and(
    search ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) : undefined,
    role ? eq(user.role, role) : undefined,
    planUserIds ? inArray(user.id, planUserIds) : undefined,
  );

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(whereClause)
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

  const userIds = users.map((u) => u.id);

  const prefs = userIds.length
    ? await db
        .select({
          userId: userPreferences.userId,
          gender: userPreferences.gender,
          phone: userPreferences.phone,
          purposes: userPreferences.purposes,
          otherPurpose: userPreferences.otherPurpose,
          preferredTimeOfDay: userPreferences.preferredTimeOfDay,
          timezone: userPreferences.timezone,
        })
        .from(userPreferences)
        .where(inArray(userPreferences.userId, userIds))
    : [];

  const acquisitions = userIds.length
    ? await db
        .select({
          userId: userAcquisition.userId,
          utmSource: userAcquisition.utmSource,
          utmMedium: userAcquisition.utmMedium,
          utmCampaign: userAcquisition.utmCampaign,
          referrer: userAcquisition.referrer,
          landingPage: userAcquisition.landingPage,
        })
        .from(userAcquisition)
        .where(inArray(userAcquisition.userId, userIds))
    : [];

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
      name: rooms.name,
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
    name?: string | null;
    scheduledStartUtc: Date;
    scheduledEndUtc: Date;
    capacity: number;
    meetLink: string;
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

  // Group classes join via Google Meet, not 100ms — no hms room is created.
  const [inserted] = await db
    .insert(rooms)
    .values({
      type: ROOM_TYPE.GROUP,
      status: ROOM_STATUS.IDLE,
      instructorId: params.instructorId,
      name: params.name ?? null,
      capacity: params.capacity,
      scheduledStart: params.scheduledStartUtc,
      scheduledEnd: params.scheduledEndUtc,
      meetLink: params.meetLink,
    })
    .returning();

  // Fire-and-forget: notify eligible group-plan users about the new class
  notifyEligibleGroupUsers(db, inserted.id, {
    scheduledStart: params.scheduledStartUtc,
    instructorId: params.instructorId,
    instructorName: instructor?.name ?? "your instructor",
    meetLink: params.meetLink,
  }).catch((err) => console.error("group room notification failed", err));

  return { roomId: inserted.id };
}

export async function updateGroupRoom(
  db: AppDatabase,
  roomId: string,
  params: {
    instructorId?: string;
    name?: string | null;
    scheduledStartUtc?: Date;
    scheduledEndUtc?: Date;
    capacity?: number;
    meetLink?: string;
  },
) {
  const [existing] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.id, roomId), eq(rooms.type, ROOM_TYPE.GROUP)));

  if (!existing) {
    throw new Error("ROOM_NOT_FOUND");
  }
  if (existing.status === ROOM_STATUS.ENDED) {
    throw new Error("ROOM_ENDED");
  }

  const instructorId = params.instructorId ?? existing.instructorId;
  const scheduledStart = params.scheduledStartUtc ?? existing.scheduledStart;
  const scheduledEnd = params.scheduledEndUtc ?? existing.scheduledEnd;
  const capacity = params.capacity ?? existing.capacity;

  if (capacity < existing.currentOccupancy) {
    throw new Error("CAPACITY_BELOW_OCCUPANCY");
  }

  if (params.instructorId) {
    const [instructor] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, instructorId));
    if (!instructor) {
      throw new Error("INSTRUCTOR_NOT_FOUND");
    }
  }

  const conflict = await db.execute(sql`
    SELECT 1 FROM "rooms"
    WHERE "instructor_id" = ${instructorId}
      AND "id" <> ${roomId}
      AND "status" <> ${ROOM_STATUS.ENDED}
      AND tstzrange("scheduled_start", "scheduled_end") &&
          tstzrange(${scheduledStart.toISOString()}::timestamptz,
                    ${scheduledEnd.toISOString()}::timestamptz)
    LIMIT 1
  `);
  const conflictRows =
    (conflict as unknown as { rows?: unknown[] }).rows ??
    (conflict as unknown as unknown[]);
  if ((conflictRows as unknown[]).length > 0) {
    throw new Error("INSTRUCTOR_BUSY");
  }

  await db
    .update(rooms)
    .set({
      instructorId,
      name: params.name !== undefined ? params.name : existing.name,
      scheduledStart,
      scheduledEnd,
      capacity,
      meetLink: params.meetLink !== undefined ? params.meetLink : existing.meetLink,
    })
    .where(eq(rooms.id, roomId));

  return { roomId };
}

export async function deleteGroupRoom(db: AppDatabase, roomId: string) {
  const [existing] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.id, roomId), eq(rooms.type, ROOM_TYPE.GROUP)));

  if (!existing) {
    throw new Error("ROOM_NOT_FOUND");
  }
  if (existing.currentOccupancy > 0) {
    throw new Error("ROOM_HAS_BOOKINGS");
  }

  await db.delete(rooms).where(eq(rooms.id, roomId));
}

// ─── Admin: get single user detail ───────────────────────────────────────────

export async function getUserDetail(db: AppDatabase, userId: string) {
  const [u] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!u) return null;

  const [pref, acq] = await Promise.all([
    db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
    db
      .select()
      .from(userAcquisition)
      .where(eq(userAcquisition.userId, userId))
      .limit(1),
  ]);

  const subscriptions = await db
    .select({
      id: userSubscriptions.id,
      planId: userSubscriptions.planId,
      planName: plans.name,
      sessionsTotal: userSubscriptions.sessionsTotal,
      sessionsUsed: userSubscriptions.sessionsUsed,
      pricePaidCents: userSubscriptions.pricePaidCents,
      status: userSubscriptions.status,
      purchasedAt: userSubscriptions.purchasedAt,
      expiresAt: userSubscriptions.expiresAt,
    })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.purchasedAt));

  const userRoomRows = await db
    .select({
      id: rooms.id,
      type: rooms.type,
      status: rooms.status,
      scheduledStart: rooms.scheduledStart,
      scheduledEnd: rooms.scheduledEnd,
      instructorId: rooms.instructorId,
      meetLink: rooms.meetLink,
    })
    .from(roomUsers)
    .innerJoin(rooms, eq(rooms.id, roomUsers.roomId))
    .where(eq(roomUsers.userId, userId))
    .orderBy(desc(rooms.scheduledStart));

  const instructorIds = [
    ...new Set(userRoomRows.map((r) => r.instructorId).filter(Boolean) as string[]),
  ];
  const instructorRows = instructorIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, instructorIds))
    : [];
  const instrMap = new Map(instructorRows.map((i) => [i.id, i.name]));

  const privateRequests = await db
    .select({
      id: privateSessionRequests.id,
      requestedStart: privateSessionRequests.requestedStart,
      requestedEnd: privateSessionRequests.requestedEnd,
      preferredSlots: privateSessionRequests.preferredSlots,
      status: privateSessionRequests.status,
      instructorId: privateSessionRequests.instructorId,
      adminNote: privateSessionRequests.adminNote,
      createdAt: privateSessionRequests.createdAt,
    })
    .from(privateSessionRequests)
    .where(eq(privateSessionRequests.userId, userId))
    .orderBy(desc(privateSessionRequests.createdAt));

  const reqInstructorIds = [
    ...new Set(privateRequests.map((r) => r.instructorId).filter(Boolean) as string[]),
  ];
  const reqInstructorRows = reqInstructorIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, reqInstructorIds))
    : [];
  const reqInstrMap = new Map(reqInstructorRows.map((i) => [i.id, i.name]));

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    preferences: pref[0] ?? null,
    acquisition: acq[0] ?? null,
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      planName: s.planName,
      sessionsTotal: s.sessionsTotal,
      sessionsUsed: s.sessionsUsed,
      pricePaidCents: s.pricePaidCents,
      status: s.status,
      purchasedAt: s.purchasedAt.toISOString(),
      expiresAt: s.expiresAt?.toISOString() ?? null,
    })),
    rooms: userRoomRows.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      scheduledStart: r.scheduledStart.toISOString(),
      scheduledEnd: r.scheduledEnd.toISOString(),
      instructorName: r.instructorId ? (instrMap.get(r.instructorId) ?? null) : null,
      meetLink: r.meetLink,
    })),
    privateRequests: privateRequests.map((r) => ({
      id: r.id,
      requestedStart: r.requestedStart.toISOString(),
      requestedEnd: r.requestedEnd.toISOString(),
      preferredSlots: r.preferredSlots ?? [],
      status: r.status as "pending" | "approved" | "rejected",
      instructorName: r.instructorId ? (reqInstrMap.get(r.instructorId) ?? null) : null,
      adminNote: r.adminNote ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
