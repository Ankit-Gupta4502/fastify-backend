import type { OrganizationSizeBand } from "@yoga-app/shared";
import { and, desc, eq, gt, inArray, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { drizzle } from "../db";
import {
  corporatePlans,
  corporateSeatTiers,
  coupons,
  organizationMembers,
  organizationSubscriptions,
  organizations,
  plans,
  rooms,
  roomUsers,
  user,
  userSubscriptions,
} from "../schema/schema";
import { ROOM_TYPE } from "../constants/sessions";
import { CORPORATE_SELF_PAY_DISCOUNT_PERCENT } from "../constants/organization";
import { generateReferralCode } from "../utils/referral.utils";
import { sendOrganizationInviteEmail } from "./organization-invite-email.service";
import { getRazorpay, getRazorpayKeyId } from "./razorpay.service";

export interface CreateOrganizationInput {
  createdByUserId: string;
  createdByEmail: string;
  name: string;
  sizeBand: OrganizationSizeBand;
}

// Creates the organization and its first (admin) membership row atomically —
// used by both the email/password and Google "sign up as a company" paths.
export async function createOrganizationForUser(
  input: CreateOrganizationInput,
): Promise<{ organizationId: string }> {
  return drizzle.transaction(async (trx) => {
    const [organization] = await trx
      .insert(organizations)
      .values({
        name: input.name,
        sizeBand: input.sizeBand,
        createdByUserId: input.createdByUserId,
      })
      .returning({ id: organizations.id });

    await trx.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: input.createdByUserId,
      invitedEmail: input.createdByEmail,
      role: "admin",
      status: "joined",
      joinedAt: new Date(),
    });

    // Auto-generate the org's self-pay discount coupon — members who don't
    // get a sponsored seat use this at checkout instead of the flat
    // site-wide discount (see coupon.service.ts).
    await trx.insert(coupons).values({
      code: generateReferralCode(),
      type: "percent",
      value: CORPORATE_SELF_PAY_DISCOUNT_PERCENT,
      scope: "organization",
      organizationId: organization.id,
      isActive: true,
    });

    return { organizationId: organization.id };
  });
}

// True if `userId` is a joined admin of `organizationId` — the org-admin
// equivalent of the platform's requireRole(USER_ROLES.ADMIN) check.
export async function isOrganizationAdmin(
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const [member] = await drizzle
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.role, "admin"),
        eq(organizationMembers.status, "joined"),
      ),
    );
  return !!member;
}

// Any joined member (not just admins) can look up their org's self-pay
// coupon — they need the code to use it at checkout.
export async function getOrganizationCouponForMember(
  organizationId: string,
  userId: string,
) {
  const [membership] = await drizzle
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "joined"),
      ),
    );
  if (!membership) return null;

  const [coupon] = await drizzle
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.organizationId, organizationId),
        eq(coupons.scope, "organization"),
      ),
    );
  return coupon ?? null;
}

export async function getOrganizationById(organizationId: string) {
  const [organization] = await drizzle
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId));
  return organization ?? null;
}

export async function listOrganizationMembers(organizationId: string) {
  return drizzle
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, organizationId))
    .orderBy(desc(organizationMembers.invitedAt));
}

export interface InviteMembersInput {
  organizationId: string;
  organizationName: string;
  invitedByUserId: string;
  inviterName: string;
  emails: string[];
}

// Creates one "invited" row per email (skipping emails already invited/joined
// to this org) and sends the invite email for each new one.
export async function inviteMembersToOrganization(
  input: InviteMembersInput,
): Promise<{ invited: string[]; skipped: string[] }> {
  const existing = await drizzle
    .select({ invitedEmail: organizationMembers.invitedEmail })
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, input.organizationId));
  const existingEmails = new Set(
    existing.map((row) => row.invitedEmail.toLowerCase()),
  );

  const invited: string[] = [];
  const skipped: string[] = [];

  for (const email of input.emails) {
    const normalized = email.toLowerCase();
    if (existingEmails.has(normalized)) {
      skipped.push(email);
      continue;
    }

    const inviteToken = generateReferralCode();
    await drizzle.insert(organizationMembers).values({
      organizationId: input.organizationId,
      invitedEmail: email,
      role: "member",
      status: "invited",
      inviteToken,
      invitedByUserId: input.invitedByUserId,
    });

    try {
      await sendOrganizationInviteEmail({
        inviteeEmail: email,
        organizationName: input.organizationName,
        inviterName: input.inviterName,
        inviteToken,
      });
    } catch (err) {
      console.error("[organization] failed to send invite email", err);
    }

    invited.push(email);
    existingEmails.add(normalized);
  }

  return { invited, skipped };
}

export async function getInviteByToken(token: string) {
  const [invite] = await drizzle
    .select({
      id: organizationMembers.id,
      status: organizationMembers.status,
      invitedEmail: organizationMembers.invitedEmail,
      organizationId: organizationMembers.organizationId,
      organizationName: organizations.name,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(eq(organizationMembers.inviteToken, token));
  return invite ?? null;
}

// Attaches an existing/new user to the org they were invited to, and — if
// the org still has unsponsored seats — grants them a free sponsored
// subscription (auto-fill in join order).
export async function acceptOrgInvite(
  token: string,
  acceptingUser: { id: string; email: string },
): Promise<{ organizationId: string } | null> {
  return drizzle.transaction(async (trx) => {
    const [invite] = await trx
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.inviteToken, token));

    if (!invite || invite.status !== "invited") return null;

    await trx
      .update(organizationMembers)
      .set({
        userId: acceptingUser.id,
        status: "joined",
        joinedAt: new Date(),
      })
      .where(eq(organizationMembers.id, invite.id));

    await trySponsorMember(trx, invite.organizationId, invite.id, acceptingUser.id);

    return { organizationId: invite.organizationId };
  });
}

// Grants a free sponsored userSubscriptions row to `userId`'s membership if
// the org still has purchased seats that no one has consumed yet — called
// once right after a member joins (auto-fill in join order).
async function trySponsorMember(
  trx: Parameters<Parameters<typeof drizzle.transaction>[0]>[0],
  organizationId: string,
  memberId: string,
  userId: string,
): Promise<void> {
  const [{ totalSeats }] = await trx
    .select({
      totalSeats: sql<number>`coalesce(sum(${organizationSubscriptions.seatsPurchased}), 0)`,
    })
    .from(organizationSubscriptions)
    .where(
      and(
        eq(organizationSubscriptions.organizationId, organizationId),
        eq(organizationSubscriptions.status, "active"),
      ),
    );

  const [{ sponsoredCount }] = await trx
    .select({ sponsoredCount: sql<number>`count(*)` })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        isNotNull(organizationMembers.sponsoredUserSubscriptionId),
      ),
    );

  if (Number(sponsoredCount) >= Number(totalSeats)) return;

  const [activeSubscription] = await trx
    .select()
    .from(organizationSubscriptions)
    .where(
      and(
        eq(organizationSubscriptions.organizationId, organizationId),
        eq(organizationSubscriptions.status, "active"),
      ),
    )
    .orderBy(desc(organizationSubscriptions.purchasedAt))
    .limit(1);
  if (!activeSubscription) return;

  const [corporatePlan] = await trx
    .select()
    .from(corporatePlans)
    .where(eq(corporatePlans.id, activeSubscription.corporatePlanId));
  if (!corporatePlan) return;

  const [linkedPlan] = await trx
    .select()
    .from(plans)
    .where(eq(plans.id, corporatePlan.linkedPlanId));
  if (!linkedPlan) return;

  const [sponsoredSubscription] = await trx
    .insert(userSubscriptions)
    .values({
      userId,
      planId: linkedPlan.id,
      sessionsTotal: linkedPlan.sessionsPerMonth ?? null,
      pricePaidCents: 0,
      currency: activeSubscription.currency,
      status: "active",
      purchasedAt: new Date(),
      expiresAt: activeSubscription.expiresAt,
      source: "corporate_sponsored",
      organizationId,
      organizationSubscriptionId: activeSubscription.id,
    })
    .returning({ id: userSubscriptions.id });

  await trx
    .update(organizationMembers)
    .set({ sponsoredUserSubscriptionId: sponsoredSubscription.id })
    .where(eq(organizationMembers.id, memberId));
}

// Re-checks every joined-but-unsponsored member in join order and sponsors
// as many as the org's currently active purchased seats allow. Called after
// a seat purchase is activated (more seats just became available) — each
// member is sponsored in its own transaction so the running seat count is
// always read fresh.
export async function sponsorEligibleOrgMembers(
  organizationId: string,
): Promise<void> {
  const unsponsored = await drizzle
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
    })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.status, "joined"),
        isNull(organizationMembers.sponsoredUserSubscriptionId),
      ),
    )
    .orderBy(organizationMembers.joinedAt);

  for (const member of unsponsored) {
    if (!member.userId) continue;
    const userId = member.userId;
    await drizzle.transaction(async (trx) => {
      await trySponsorMember(trx, organizationId, member.id, userId);
    });
  }
}

export async function listCorporatePlans() {
  return drizzle.select().from(corporatePlans);
}

async function findSeatTier(seats: number) {
  const [tier] = await drizzle
    .select()
    .from(corporateSeatTiers)
    .where(
      and(
        lte(corporateSeatTiers.minSeats, seats),
        or(
          isNull(corporateSeatTiers.maxSeats),
          sql`${corporateSeatTiers.maxSeats} >= ${seats}`,
        ),
      ),
    )
    .orderBy(desc(corporateSeatTiers.minSeats))
    .limit(1);
  return tier ?? null;
}

export interface CreateSeatPurchaseInput {
  organizationId: string;
  corporatePlanId: string;
  seats: number;
  isIndia: boolean;
}

export type CreateSeatPurchaseResult =
  | {
      ok: true;
      subscriptionId: string;
      keyId: string;
      organizationSubscriptionId: string;
    }
  | { ok: false; error: "corporate_plan_not_found" | "no_matching_seat_tier" | "pricing_not_configured" };

// Sells a block of N seats as a single bulk Razorpay subscription — the
// "parent" organization_subscriptions row, distinct from any individual
// userSubscriptions row (see plan doc: avoids Razorpay's 1-subscription =
// 1 unique-constrained-row limitation in the webhook resolver).
export async function createOrganizationSeatPurchase(
  input: CreateSeatPurchaseInput,
): Promise<CreateSeatPurchaseResult> {
  const [corporatePlan] = await drizzle
    .select()
    .from(corporatePlans)
    .where(eq(corporatePlans.id, input.corporatePlanId));
  if (!corporatePlan) return { ok: false, error: "corporate_plan_not_found" };

  const tier = await findSeatTier(input.seats);
  if (!tier) return { ok: false, error: "no_matching_seat_tier" };

  const baseAmount = input.isIndia
    ? corporatePlan.basePricePerSeatInrPaise
    : corporatePlan.basePricePerSeatCents;
  if (baseAmount == null) return { ok: false, error: "pricing_not_configured" };

  const currency = input.isIndia ? "INR" : "USD";
  const totalAmount = Math.round(
    baseAmount * input.seats * (1 - tier.discountPercent / 100),
  );
  const period = corporatePlan.billingInterval === "week" ? "weekly" as const : "monthly" as const;

  const rpPlan = await getRazorpay().plans.create({
    item: {
      name: `${corporatePlan.name} — ${input.seats} seats`,
      amount: totalAmount,
      currency,
    },
    period,
    interval: 1,
    notes: {
      organizationId: input.organizationId,
      corporatePlanId: corporatePlan.id,
      seats: String(input.seats),
    },
  });

  const rpSub = await getRazorpay().subscriptions.create({
    plan_id: rpPlan.id,
    total_count: 120,
    customer_notify: 1,
    notes: {
      organizationId: input.organizationId,
      corporatePlanId: corporatePlan.id,
      seats: String(input.seats),
    },
  });

  const [organizationSubscription] = await drizzle
    .insert(organizationSubscriptions)
    .values({
      organizationId: input.organizationId,
      corporatePlanId: corporatePlan.id,
      seatTierId: tier.id,
      seatsPurchased: input.seats,
      pricePaidTotalCents: currency === "USD" ? totalAmount : null,
      pricePaidTotalInrPaise: currency === "INR" ? totalAmount : null,
      currency,
      status: "pending_payment",
      razorpaySubscriptionId: rpSub.id,
    })
    .returning({ id: organizationSubscriptions.id });

  return {
    ok: true,
    subscriptionId: rpSub.id,
    keyId: getRazorpayKeyId(),
    organizationSubscriptionId: organizationSubscription.id,
  };
}

export type VerifySeatPurchaseResult =
  | { ok: true; organizationSubscriptionId: string }
  | { ok: false; error: "not_found" | "org_mismatch" };

// Mirrors payments.controller.ts's verify() — activates the bulk purchase
// once Razorpay checkout succeeds client-side, then fans sponsorship out to
// whoever's already joined and waiting for a seat.
export async function verifyOrganizationSeatPurchase(params: {
  organizationId: string;
  razorpaySubscriptionId: string;
}): Promise<VerifySeatPurchaseResult> {
  const [organizationSubscription] = await drizzle
    .select()
    .from(organizationSubscriptions)
    .where(
      eq(
        organizationSubscriptions.razorpaySubscriptionId,
        params.razorpaySubscriptionId,
      ),
    );

  if (!organizationSubscription) return { ok: false, error: "not_found" };
  if (organizationSubscription.organizationId !== params.organizationId) {
    return { ok: false, error: "org_mismatch" };
  }

  if (organizationSubscription.status !== "pending_payment") {
    return { ok: true, organizationSubscriptionId: organizationSubscription.id };
  }

  const [corporatePlan] = await drizzle
    .select()
    .from(corporatePlans)
    .where(eq(corporatePlans.id, organizationSubscription.corporatePlanId));

  const now = new Date();
  const expiresAt = new Date(now);
  if (corporatePlan?.billingInterval === "week") {
    expiresAt.setDate(expiresAt.getDate() + 7);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  await drizzle
    .update(organizationSubscriptions)
    .set({ status: "active", expiresAt })
    .where(
      and(
        eq(organizationSubscriptions.id, organizationSubscription.id),
        eq(organizationSubscriptions.status, "pending_payment"),
      ),
    );

  await sponsorEligibleOrgMembers(params.organizationId);

  return { ok: true, organizationSubscriptionId: organizationSubscription.id };
}

export interface OrganizationClassAttendee {
  userId: string;
  name: string;
  email: string;
}

export interface OrganizationClass {
  id: string;
  name: string | null;
  instructorId: string;
  instructorName: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  capacity: number;
  currentOccupancy: number;
  status: string;
  attendees: OrganizationClassAttendee[];
}

// Upcoming org-restricted classes + who's attending each one — powers the
// org admin dashboard's calendar view.
export async function listOrganizationClasses(
  organizationId: string,
): Promise<OrganizationClass[]> {
  const roomRows = await drizzle
    .select({
      id: rooms.id,
      name: rooms.name,
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
    .where(
      and(
        eq(rooms.organizationId, organizationId),
        eq(rooms.type, ROOM_TYPE.GROUP),
        gt(rooms.scheduledEnd, new Date()),
      ),
    )
    .orderBy(rooms.scheduledStart);

  const roomIds = roomRows.map((r) => r.id);
  const attendeeRows =
    roomIds.length > 0
      ? await drizzle
          .select({
            roomId: roomUsers.roomId,
            userId: roomUsers.userId,
            name: user.name,
            email: user.email,
          })
          .from(roomUsers)
          .innerJoin(user, eq(roomUsers.userId, user.id))
          .where(
            and(inArray(roomUsers.roomId, roomIds), isNull(roomUsers.leftAt)),
          )
      : [];

  const attendeesByRoom = new Map<string, OrganizationClassAttendee[]>();
  for (const row of attendeeRows) {
    const list = attendeesByRoom.get(row.roomId) ?? [];
    list.push({ userId: row.userId, name: row.name, email: row.email });
    attendeesByRoom.set(row.roomId, list);
  }

  return roomRows.map((r) => ({
    ...r,
    attendees: attendeesByRoom.get(r.id) ?? [],
  }));
}

export interface MyOrganizationSummary {
  organizationId: string;
  name: string;
  sizeBand: string;
  role: "admin" | "member";
}

// Every org this user is a joined member of — powers the org dashboard's
// "which organization am I looking at" gate on the frontend.
export async function listOrganizationsForUser(
  userId: string,
): Promise<MyOrganizationSummary[]> {
  const rows = await drizzle
    .select({
      organizationId: organizations.id,
      name: organizations.name,
      sizeBand: organizations.sizeBand,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "joined"),
      ),
    );
  return rows;
}

export type PromoteMemberResult = { ok: true } | { ok: false; error: "not_found" };

export async function promoteOrgMember(
  organizationId: string,
  memberId: string,
): Promise<PromoteMemberResult> {
  const [member] = await drizzle
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.id, memberId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.status, "joined"),
      ),
    );
  if (!member) return { ok: false, error: "not_found" };

  await drizzle
    .update(organizationMembers)
    .set({ role: "admin" })
    .where(eq(organizationMembers.id, memberId));

  return { ok: true };
}

export type RemoveMemberResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "last_admin" };

// Removing a member immediately deactivates any sponsored subscription they
// held (rather than letting it run to period end) and offers the freed seat
// to the next member still waiting on one.
export async function removeOrgMember(
  organizationId: string,
  memberId: string,
): Promise<RemoveMemberResult> {
  const [member] = await drizzle
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.id, memberId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.status, "joined"),
      ),
    );
  if (!member) return { ok: false, error: "not_found" };

  if (member.role === "admin") {
    const [{ adminCount }] = await drizzle
      .select({ adminCount: sql<number>`count(*)` })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.role, "admin"),
          eq(organizationMembers.status, "joined"),
        ),
      );
    if (Number(adminCount) <= 1) return { ok: false, error: "last_admin" };
  }

  await drizzle
    .update(organizationMembers)
    .set({ status: "removed", sponsoredUserSubscriptionId: null })
    .where(eq(organizationMembers.id, memberId));

  if (member.sponsoredUserSubscriptionId) {
    await drizzle
      .update(userSubscriptions)
      .set({ status: "cancelled" })
      .where(eq(userSubscriptions.id, member.sponsoredUserSubscriptionId));

    await sponsorEligibleOrgMembers(organizationId);
  }

  return { ok: true };
}
