import cron from "node-cron";
import { and, lt, sql } from "drizzle-orm";
import type { FastifyBaseLogger } from "fastify";
import type { AppDatabase } from "../types/database.types";
import { user, plans, userSubscriptions } from "../schema/schema";

async function resetWeeklyQuota(db: AppDatabase, log: FastifyBaseLogger) {
  const currentWeekStart = sql`date_trunc('week', now())`;

  // Reset sessionsUsedThisWeek for users who have an active weekly (group_live) subscription
  // and whose counter hasn't been reset yet this week.
  const result = await db
    .update(user)
    .set({
      sessionsUsedThisWeek: 0,
      weekResetAt: sql`date_trunc('week', now())`,
    })
    .where(
      and(
        lt(user.weekResetAt, currentWeekStart),
        sql`${user.id} IN (
          SELECT us.user_id
          FROM user_subscriptions us
          JOIN plans p ON p.id = us.plan_id
          WHERE us.status = 'active'
            AND p.billing_interval = 'week'
            AND p.sessions_per_week IS NOT NULL
            AND (us.sessions_total IS NULL OR us.sessions_used < us.sessions_total)
        )`,
      ),
    );

  log.info({ rowsReset: result.count ?? 0 }, "Weekly quota reset complete");
}

export function registerQuotaResetJob(db: AppDatabase, log: FastifyBaseLogger) {
  // Catch-up on startup: reset any stale counters
  resetWeeklyQuota(db, log).catch((err) =>
    log.error(err, "Startup weekly quota reset failed"),
  );

  // Every Monday at 00:05 UTC
  cron.schedule("5 0 * * 1", () => {
    resetWeeklyQuota(db, log).catch((err) =>
      log.error(err, "Scheduled weekly quota reset failed"),
    );
  });

  log.info("Quota reset jobs registered (weekly: Mon 00:05)");
}
