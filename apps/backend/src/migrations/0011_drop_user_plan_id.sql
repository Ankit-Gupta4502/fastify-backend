-- user.plan_id is no longer the source of truth.
-- Active plan is derived from user_subscriptions.
ALTER TABLE "user" DROP COLUMN IF EXISTS "plan_id";
