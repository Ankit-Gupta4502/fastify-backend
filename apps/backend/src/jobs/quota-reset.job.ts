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
        sql`${user.planId} IN (SELECT id FROM plans WHERE sessions_per_week IS NOT NULL)`,
      ),
    );

  log.info({ rowsReset: result.rowCount ?? 0 }, "Weekly quota reset complete");
}

export function registerQuotaResetJob(db: AppDatabase, log: FastifyBaseLogger) {
  // Catch-up: run immediately on startup if any user's weekResetAt is behind the current week
  resetWeeklyQuota(db, log).catch((err) =>
    log.error(err, "Startup quota reset failed"),
  );

  // Every Monday at 00:05 server time
  cron.schedule("5 0 * * 1", () => {
    resetWeeklyQuota(db, log).catch((err) =>
      log.error(err, "Scheduled quota reset failed"),
    );
  });

  log.info("Quota reset job registered (every Monday 00:05)");
}
