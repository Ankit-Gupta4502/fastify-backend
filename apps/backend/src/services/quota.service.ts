import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { plans, user, userSubscriptions } from "../schema/schema";

export type QuotaSnapshot = {
  // For session-pool plans (private / specialised)
  sessionsRemaining: number | null;
  // For recurring weekly plans (group_live)
  used: number;
  limit: number | null;
};

export async function getQuotaSnapshot(
  db: AppDatabase,
  userId: string,
): Promise<QuotaSnapshot | null> {
  // Find the user's active subscription
  const [sub] = await db
    .select({
      sessionsTotal: userSubscriptions.sessionsTotal,
      sessionsUsed: userSubscriptions.sessionsUsed,
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
          isNull(userSubscriptions.sessionsTotal),
          lt(userSubscriptions.sessionsUsed, userSubscriptions.sessionsTotal),
        ),
      ),
    )
    .orderBy(desc(userSubscriptions.purchasedAt))
    .limit(1);

  if (!sub) return null;

  // For session-pool plans: remaining = total - used
  const sessionsRemaining =
    sub.sessionsTotal !== null ? sub.sessionsTotal - sub.sessionsUsed : null;

  // For recurring (group_live) plans: read the weekly counter from user
  let used = 0;
  let limit: number | null = null;

  if (sub.billingInterval === "week") {
    const [userRow] = await db
      .select({ sessionsUsedThisWeek: user.sessionsUsedThisWeek })
      .from(user)
      .where(eq(user.id, userId));

    used = userRow?.sessionsUsedThisWeek ?? 0;
    limit = sub.sessionsPerWeek;
  }

  return { sessionsRemaining, used, limit };
}

export function isOverQuota(snapshot: QuotaSnapshot): boolean {
  if (snapshot.sessionsRemaining !== null) {
    return snapshot.sessionsRemaining <= 0;
  }
  return snapshot.limit !== null && snapshot.used >= snapshot.limit;
}
