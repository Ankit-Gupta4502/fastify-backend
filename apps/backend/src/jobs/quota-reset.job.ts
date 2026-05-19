import cron from "node-cron";
import { and, isNotNull, lt, sql } from "drizzle-orm";
import type { FastifyBaseLogger } from "fastify";
import type { AppDatabase } from "../types/database.types";
import { user, plans } from "../schema/schema";

async function resetWeeklyQuota(db: AppDatabase, log: FastifyBaseLogger) {
  const currentWeekStart = sql`date_trunc('week', now())`;

  const result = await db
    .update(user)
    .set({
      sessionsUsedThisWeek: 0,
      weekResetAt: sql`date_trunc('week', now())`,
    })
    .where(
      and(
        isNotNull(user.planId),
        lt(user.weekResetAt, currentWeekStart),
        sql`${user.planId} IN (
          SELECT id FROM plans
          WHERE sessions_per_week IS NOT NULL
            AND billing_interval = 'week'
        )`,
      ),
    );

  log.info({ rowsReset: result.rowCount ?? 0 }, "Weekly quota reset complete");
}

async function resetMonthlyQuota(db: AppDatabase, log: FastifyBaseLogger) {
  const currentMonthStart = sql`date_trunc('month', now())`;

  const result = await db
    .update(user)
    .set({
      sessionsUsedThisMonth: 0,
      monthResetAt: sql`date_trunc('month', now())`,
    })
    .where(
      and(
        isNotNull(user.planId),
        lt(user.monthResetAt, currentMonthStart),
        sql`${user.planId} IN (
          SELECT id FROM plans
          WHERE sessions_per_month IS NOT NULL
            AND billing_interval = 'month'
        )`,
      ),
    );

  log.info({ rowsReset: result.rowCount ?? 0 }, "Monthly quota reset complete");
}

export function registerQuotaResetJob(db: AppDatabase, log: FastifyBaseLogger) {
  // Catch-up on startup: reset any stale counters
  resetWeeklyQuota(db, log).catch((err) =>
    log.error(err, "Startup weekly quota reset failed"),
  );
  resetMonthlyQuota(db, log).catch((err) =>
    log.error(err, "Startup monthly quota reset failed"),
  );

  // Every Monday at 00:05 UTC
  cron.schedule("5 0 * * 1", () => {
    resetWeeklyQuota(db, log).catch((err) =>
      log.error(err, "Scheduled weekly quota reset failed"),
    );
  });

  // 1st of every month at 00:10 UTC
  cron.schedule("10 0 1 * *", () => {
    resetMonthlyQuota(db, log).catch((err) =>
      log.error(err, "Scheduled monthly quota reset failed"),
    );
  });

  log.info("Quota reset jobs registered (weekly: Mon 00:05 · monthly: 1st 00:10)");
}
