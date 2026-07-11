-- Add billing_interval to plans (week | month), default existing plans to 'month'
ALTER TABLE "plans"
  ADD COLUMN IF NOT EXISTS "billing_interval" text NOT NULL DEFAULT 'month';
--> statement-breakpoint
-- group_live quotas reset weekly
UPDATE "plans" SET "billing_interval" = 'week' WHERE "name" = 'group_live';
--> statement-breakpoint
-- Add monthly quota counters to user
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "sessions_used_this_month" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "month_reset_at" timestamp with time zone NOT NULL DEFAULT date_trunc('month', now());
