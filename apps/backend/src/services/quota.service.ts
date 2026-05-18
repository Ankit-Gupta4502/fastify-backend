import { eq } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { plans, user } from "../schema/schema";

export type QuotaSnapshot = {
  used: number;
  limit: number | null;
};

export async function getQuotaSnapshot(
  db: AppDatabase,
  userId: string,
): Promise<QuotaSnapshot | null> {
  const [row] = await db
    .select({
      used: user.sessionsUsedThisWeek,
      limit: plans.sessionsPerWeek,
    })
    .from(user)
    .leftJoin(plans, eq(user.planId, plans.id))
    .where(eq(user.id, userId));

  if (!row) {
    return null;
  }

  return { used: row.used ?? 0, limit: row.limit ?? null };
}

export function isOverQuota(snapshot: QuotaSnapshot): boolean {
  return snapshot.limit !== null && snapshot.used >= snapshot.limit;
}
