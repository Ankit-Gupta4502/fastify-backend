import { and, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { demoRequests } from "../schema/schema";
import { user } from "../models/auth.schema";
import { formatForInstructor } from "./timezone.service";
import {
  sendDemoRequestAdminNotification,
  sendDemoRequestUserAck,
  sendDemoRequestApproved,
  sendDemoRequestRejected,
  sendDemoRequestNeedsInfo,
  sendDemoInstructorAssigned,
  sendDemoMeetingScheduled,
  sendDemoInstructorNotification,
} from "./demo-email.service";

type DB = AppDatabase;

// Statuses that mean a request is still in-flight (user cannot submit a new one)
const ACTIVE_STATUSES = [
  "pending",
  "approved",
  "instructor_assigned",
  "meeting_scheduled",
] as const;

/**
 * Convert a local date+time string in the given IANA timezone to a UTC Date.
 * Works without any third-party library using the Intl API.
 */
function localToUtc(date: string, time: string, timezone: string): Date {
  const localStr = `${date}T${time}:00`;
  // Treat the string as UTC first, then compute the tz offset at that instant
  const asUtc = new Date(localStr + "Z");
  const inTz = new Date(asUtc.toLocaleString("en-US", { timeZone: timezone }));
  const inUtcSameStr = new Date(
    asUtc.toLocaleString("en-US", { timeZone: "UTC" }),
  );
  const offsetMs = inUtcSameStr.getTime() - inTz.getTime();
  return new Date(asUtc.getTime() + offsetMs);
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createDemoRequest(
  db: DB,
  userId: string,
  body: {
    gender: string;
    phone: string;
    purposes: string[];
    otherPurpose?: string;
    preferredDate: string;
    preferredTime: string;
    timezone: string;
  },
): Promise<{ id: string; status: string }> {
  const [existing] = await db
    .select({ id: demoRequests.id, status: demoRequests.status })
    .from(demoRequests)
    .where(
      and(
        eq(demoRequests.userId, userId),
        inArray(demoRequests.status, [...ACTIVE_STATUSES]),
      ),
    )
    .limit(1);

  if (existing) {
    throw new Error("ACTIVE_REQUEST_EXISTS");
  }

  const utcScheduledAt = localToUtc(
    body.preferredDate,
    body.preferredTime,
    body.timezone,
  );

  const [created] = await db
    .insert(demoRequests)
    .values({
      userId,
      gender: body.gender,
      phone: body.phone,
      purposes: body.purposes,
      otherPurpose: body.otherPurpose ?? null,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      timezone: body.timezone,
      utcScheduledAt,
    })
    .returning({ id: demoRequests.id, status: demoRequests.status });

  return created;
}

// ── Send post-creation emails (fire-and-forget) ──────────────────────────────

export async function notifyOnDemoCreated(params: {
  adminEmail: string;
  userName: string;
  userEmail: string;
  phone: string;
  purposes: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
}): Promise<void> {
  await Promise.allSettled([
    sendDemoRequestAdminNotification({
      adminEmail: params.adminEmail,
      userName: params.userName,
      userEmail: params.userEmail,
      phone: params.phone,
      purposes: params.purposes,
      preferredDate: params.preferredDate,
      preferredTime: params.preferredTime,
      timezone: params.timezone,
    }),
    sendDemoRequestUserAck({
      userEmail: params.userEmail,
      userName: params.userName,
    }),
  ]);
}

// ── User: fetch own requests ──────────────────────────────────────────────────

export async function getUserDemoRequests(db: DB, userId: string) {
  const rows = await db
    .select({
      id: demoRequests.id,
      gender: demoRequests.gender,
      phone: demoRequests.phone,
      purposes: demoRequests.purposes,
      otherPurpose: demoRequests.otherPurpose,
      preferredDate: demoRequests.preferredDate,
      preferredTime: demoRequests.preferredTime,
      timezone: demoRequests.timezone,
      utcScheduledAt: demoRequests.utcScheduledAt,
      status: demoRequests.status,
      rejectionReason: demoRequests.rejectionReason,
      needsInfoMessage: demoRequests.needsInfoMessage,
      meetingLink: demoRequests.meetingLink,
      meetingPlatform: demoRequests.meetingPlatform,
      assignedInstructorId: demoRequests.assignedInstructorId,
      createdAt: demoRequests.createdAt,
    })
    .from(demoRequests)
    .where(eq(demoRequests.userId, userId))
    .orderBy(demoRequests.createdAt);

  const instructorIds = [
    ...new Set(
      rows
        .map((r) => r.assignedInstructorId)
        .filter((id): id is string => id !== null),
    ),
  ];

  let instructorMap: Record<string, { id: string; name: string }> = {};
  if (instructorIds.length > 0) {
    const instructors = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(inArray(user.id, instructorIds));
    instructorMap = Object.fromEntries(
      instructors.map((i) => [i.id, { id: i.id, name: i.name }]),
    );
  }

  return rows.map((r) => ({
    ...r,
    utcScheduledAt: r.utcScheduledAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    assignedInstructor: r.assignedInstructorId
      ? (instructorMap[r.assignedInstructorId] ?? null)
      : null,
  }));
}

// ── User: update own request when status is needs_information ────────────────

export async function updateUserDemoRequest(
  db: DB,
  requestId: string,
  userId: string,
  body: {
    gender: string;
    phone: string;
    purposes: string[];
    otherPurpose?: string;
    preferredDate: string;
    preferredTime: string;
    timezone: string;
  },
): Promise<boolean> {
  const [existing] = await db
    .select({ id: demoRequests.id, status: demoRequests.status })
    .from(demoRequests)
    .where(
      and(
        eq(demoRequests.id, requestId),
        eq(demoRequests.userId, userId),
      ),
    )
    .limit(1);

  if (!existing) return false;
  if (existing.status !== "needs_information") {
    throw new Error("REQUEST_NOT_EDITABLE");
  }

  const utcScheduledAt = localToUtc(
    body.preferredDate,
    body.preferredTime,
    body.timezone,
  );

  await db
    .update(demoRequests)
    .set({
      gender: body.gender,
      phone: body.phone,
      purposes: body.purposes,
      otherPurpose: body.otherPurpose ?? null,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      timezone: body.timezone,
      utcScheduledAt,
      status: "pending",
      needsInfoMessage: null,
    })
    .where(eq(demoRequests.id, requestId));

  return true;
}

// ── Admin: list all ──────────────────────────────────────────────────────────

export async function listAllDemoRequests(db: DB) {
  const rows = await db
    .select({
      id: demoRequests.id,
      userId: demoRequests.userId,
      gender: demoRequests.gender,
      phone: demoRequests.phone,
      purposes: demoRequests.purposes,
      otherPurpose: demoRequests.otherPurpose,
      preferredDate: demoRequests.preferredDate,
      preferredTime: demoRequests.preferredTime,
      timezone: demoRequests.timezone,
      utcScheduledAt: demoRequests.utcScheduledAt,
      status: demoRequests.status,
      rejectionReason: demoRequests.rejectionReason,
      needsInfoMessage: demoRequests.needsInfoMessage,
      adminNotes: demoRequests.adminNotes,
      assignedInstructorId: demoRequests.assignedInstructorId,
      meetingLink: demoRequests.meetingLink,
      meetingPlatform: demoRequests.meetingPlatform,
      createdAt: demoRequests.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(demoRequests)
    .innerJoin(user, eq(demoRequests.userId, user.id))
    .orderBy(demoRequests.createdAt);

  const instructorIds = [
    ...new Set(
      rows
        .map((r) => r.assignedInstructorId)
        .filter((id): id is string => id !== null),
    ),
  ];

  let instructorMap: Record<
    string,
    { id: string; name: string; email: string }
  > = {};
  if (instructorIds.length > 0) {
    const instructors = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(inArray(user.id, instructorIds));
    instructorMap = Object.fromEntries(
      instructors.map((i) => [i.id, { id: i.id, name: i.name, email: i.email }]),
    );
  }

  return rows.map((r) => ({
    ...r,
    utcScheduledAt: r.utcScheduledAt.toISOString(),
    istTime: formatForInstructor(r.utcScheduledAt),
    createdAt: r.createdAt.toISOString(),
    assignedInstructor: r.assignedInstructorId
      ? (instructorMap[r.assignedInstructorId] ?? null)
      : null,
  }));
}

// ── Admin: get single ────────────────────────────────────────────────────────

export async function getDemoRequest(db: DB, id: string) {
  const results = await listAllDemoRequests(db);
  return results.find((r) => r.id === id) ?? null;
}

// ── Admin: update status ─────────────────────────────────────────────────────

export async function updateDemoStatus(
  db: DB,
  id: string,
  update: {
    status: "approved" | "rejected" | "needs_information";
    rejectionReason?: string;
    needsInfoMessage?: string;
    adminNotes?: string;
  },
): Promise<{ userEmail: string; userName: string; status: string } | null> {
  const [existing] = await db
    .select({
      id: demoRequests.id,
      status: demoRequests.status,
      userId: demoRequests.userId,
    })
    .from(demoRequests)
    .where(eq(demoRequests.id, id))
    .limit(1);

  if (!existing) return null;

  const VALID_FROM: Record<string, string[]> = {
    approved: ["pending", "needs_information"],
    rejected: ["pending", "approved", "needs_information"],
    needs_information: ["pending"],
  };

  if (!VALID_FROM[update.status]?.includes(existing.status)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  await db
    .update(demoRequests)
    .set({
      status: update.status,
      rejectionReason: update.rejectionReason ?? null,
      needsInfoMessage: update.needsInfoMessage ?? null,
      adminNotes: update.adminNotes ?? null,
    })
    .where(eq(demoRequests.id, id));

  const [userRow] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, existing.userId))
    .limit(1);

  if (!userRow) return null;

  // Fire notification emails (non-blocking)
  void (async () => {
    if (update.status === "approved") {
      await sendDemoRequestApproved({
        userEmail: userRow.email,
        userName: userRow.name,
      }).catch(() => {});
    } else if (update.status === "rejected") {
      await sendDemoRequestRejected({
        userEmail: userRow.email,
        userName: userRow.name,
        reason: update.rejectionReason ?? null,
      }).catch(() => {});
    } else if (update.status === "needs_information") {
      await sendDemoRequestNeedsInfo({
        userEmail: userRow.email,
        userName: userRow.name,
        message: update.needsInfoMessage ?? "Please provide additional details.",
      }).catch(() => {});
    }
  })();

  return { userEmail: userRow.email, userName: userRow.name, status: update.status };
}

// ── Admin: approve + assign instructor + schedule meeting (combined) ─────────

export async function approveAndSchedule(
  db: DB,
  id: string,
  params: {
    instructorId: string;
    meetingLink: string;
    meetingPlatform: string;
    adminNotes?: string;
  },
): Promise<boolean> {
  const [existing] = await db
    .select({
      id: demoRequests.id,
      status: demoRequests.status,
      userId: demoRequests.userId,
      phone: demoRequests.phone,
      purposes: demoRequests.purposes,
      preferredDate: demoRequests.preferredDate,
      preferredTime: demoRequests.preferredTime,
      timezone: demoRequests.timezone,
    })
    .from(demoRequests)
    .where(eq(demoRequests.id, id))
    .limit(1);

  if (!existing) return false;

  if (!["pending", "needs_information"].includes(existing.status)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const [instructorRow] = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, params.instructorId))
    .limit(1);

  if (!instructorRow) throw new Error("INSTRUCTOR_NOT_FOUND");

  await db
    .update(demoRequests)
    .set({
      status: "meeting_scheduled",
      assignedInstructorId: params.instructorId,
      meetingLink: params.meetingLink,
      meetingPlatform: params.meetingPlatform,
      adminNotes: params.adminNotes ?? null,
    })
    .where(eq(demoRequests.id, id));

  const [userRow] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, existing.userId))
    .limit(1);

  if (userRow) {
    void Promise.allSettled([
      sendDemoMeetingScheduled({
        userEmail: userRow.email,
        userName: userRow.name,
        instructorName: instructorRow.name,
        preferredDate: existing.preferredDate,
        preferredTime: existing.preferredTime,
        timezone: existing.timezone,
        meetingLink: params.meetingLink,
      }),
      sendDemoInstructorNotification({
        instructorEmail: instructorRow.email,
        instructorName: instructorRow.name,
        userName: userRow.name,
        userEmail: userRow.email,
        phone: existing.phone,
        purposes: existing.purposes,
        preferredDate: existing.preferredDate,
        preferredTime: existing.preferredTime,
        timezone: existing.timezone,
        meetingLink: params.meetingLink,
      }),
    ]);
  }

  return true;
}

// ── Admin: assign instructor ─────────────────────────────────────────────────

export async function assignDemoInstructor(
  db: DB,
  id: string,
  instructorId: string,
): Promise<boolean> {
  const [existing] = await db
    .select({
      id: demoRequests.id,
      status: demoRequests.status,
      userId: demoRequests.userId,
      purposes: demoRequests.purposes,
      preferredDate: demoRequests.preferredDate,
      preferredTime: demoRequests.preferredTime,
      timezone: demoRequests.timezone,
      phone: demoRequests.phone,
    })
    .from(demoRequests)
    .where(eq(demoRequests.id, id))
    .limit(1);

  if (!existing) return false;
  if (existing.status !== "approved") throw new Error("REQUEST_NOT_APPROVED");

  const [instructorRow] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.id, instructorId))
    .limit(1);

  if (!instructorRow) throw new Error("INSTRUCTOR_NOT_FOUND");

  await db
    .update(demoRequests)
    .set({ assignedInstructorId: instructorId, status: "instructor_assigned" })
    .where(eq(demoRequests.id, id));

  const [userRow] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, existing.userId))
    .limit(1);

  if (userRow) {
    void sendDemoInstructorAssigned({
      userEmail: userRow.email,
      userName: userRow.name,
      instructorName: instructorRow.name,
    }).catch(() => {});
  }

  return true;
}

// ── Admin/Instructor: schedule meeting ───────────────────────────────────────

export async function scheduleDemoMeeting(
  db: DB,
  id: string,
  meetingLink: string,
  meetingPlatform: string,
): Promise<boolean> {
  const [existing] = await db
    .select({
      id: demoRequests.id,
      status: demoRequests.status,
      userId: demoRequests.userId,
      assignedInstructorId: demoRequests.assignedInstructorId,
      preferredDate: demoRequests.preferredDate,
      preferredTime: demoRequests.preferredTime,
      timezone: demoRequests.timezone,
    })
    .from(demoRequests)
    .where(eq(demoRequests.id, id))
    .limit(1);

  if (!existing) return false;
  if (existing.status !== "instructor_assigned") {
    throw new Error("INSTRUCTOR_NOT_ASSIGNED");
  }

  await db
    .update(demoRequests)
    .set({
      meetingLink,
      meetingPlatform,
      status: "meeting_scheduled",
    })
    .where(eq(demoRequests.id, id));

  const [userRow] = existing.userId
    ? await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, existing.userId))
        .limit(1)
    : [];

  const [instructorRow] = existing.assignedInstructorId
    ? await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, existing.assignedInstructorId))
        .limit(1)
    : [];

  if (userRow && instructorRow) {
    void Promise.allSettled([
      sendDemoMeetingScheduled({
        userEmail: userRow.email,
        userName: userRow.name,
        instructorName: instructorRow.name,
        preferredDate: existing.preferredDate,
        preferredTime: existing.preferredTime,
        timezone: existing.timezone,
        meetingLink,
      }),
    ]);
  }

  return true;
}

// ── Admin: mark completed ────────────────────────────────────────────────────

export async function completeDemoSession(
  db: DB,
  id: string,
): Promise<boolean> {
  const [existing] = await db
    .select({ id: demoRequests.id, status: demoRequests.status })
    .from(demoRequests)
    .where(eq(demoRequests.id, id))
    .limit(1);

  if (!existing) return false;
  if (existing.status !== "meeting_scheduled") {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  await db
    .update(demoRequests)
    .set({ status: "completed" })
    .where(eq(demoRequests.id, id));

  return true;
}

// ── Instructor: own assigned sessions ───────────────────────────────────────

export async function getInstructorDemoSessions(
  db: DB,
  instructorId: string,
) {
  const rows = await db
    .select({
      id: demoRequests.id,
      purposes: demoRequests.purposes,
      otherPurpose: demoRequests.otherPurpose,
      preferredDate: demoRequests.preferredDate,
      preferredTime: demoRequests.preferredTime,
      timezone: demoRequests.timezone,
      utcScheduledAt: demoRequests.utcScheduledAt,
      meetingLink: demoRequests.meetingLink,
      meetingPlatform: demoRequests.meetingPlatform,
      status: demoRequests.status,
      phone: demoRequests.phone,
      userName: user.name,
      userEmail: user.email,
    })
    .from(demoRequests)
    .innerJoin(user, eq(demoRequests.userId, user.id))
    .where(
      and(
        eq(demoRequests.assignedInstructorId, instructorId),
        inArray(demoRequests.status, [
          "instructor_assigned",
          "meeting_scheduled",
          "completed",
        ]),
      ),
    )
    .orderBy(demoRequests.utcScheduledAt);

  return rows.map((r) => ({
    ...r,
    utcScheduledAt: r.utcScheduledAt.toISOString(),
  }));
}

// ── Admin: send instructor-assignment email with meeting link ────────────────

export async function notifyInstructorWithMeeting(params: {
  instructorEmail: string;
  instructorName: string;
  userName: string;
  userEmail: string;
  phone: string;
  purposes: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingLink: string;
}): Promise<void> {
  await sendDemoInstructorNotification(params).catch(() => {});
}
