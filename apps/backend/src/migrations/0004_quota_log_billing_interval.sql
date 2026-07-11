-- Bug 2 + Bug 4: store which billing interval was active at enrolment time
-- so leaveRoom can restore the correct counter regardless of later plan changes.
ALTER TABLE "session_quota_log"
  ADD COLUMN IF NOT EXISTS "billing_interval" text;
--> statement-breakpoint
UPDATE "session_quota_log"
  SET "billing_interval" = 'week'
  WHERE "billing_interval" IS NULL;
--> statement-breakpoint
ALTER TABLE "session_quota_log"
  ALTER COLUMN "billing_interval" SET NOT NULL,
  ALTER COLUMN "billing_interval" SET DEFAULT 'week';
--> statement-breakpoint
ALTER TABLE "session_quota_log"
  ADD CONSTRAINT "chk_quota_log_billing_interval"
  CHECK ("billing_interval" IN ('week', 'month'));
--> statement-breakpoint
-- Bug 5: enforce only valid billing_interval values in plans
ALTER TABLE "plans"
  ADD CONSTRAINT "chk_plans_billing_interval"
  CHECK ("billing_interval" IN ('week', 'month'));
