-- Migration: introduce user_subscriptions as the source of truth for plan ownership.
-- user.plan_id is kept as a denormalised cache but will be removed in a future migration.

CREATE TYPE IF NOT EXISTS "public"."subscription_status" AS ENUM(
  'pending_payment',
  'active',
  'expired',
  'cancelled'
);

CREATE TABLE "user_subscriptions" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"             uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "plan_id"             uuid NOT NULL REFERENCES "plans"("id"),
  -- null = recurring plan (no session pool); integer = sessions purchased
  "sessions_total"      integer,
  "sessions_used"       integer NOT NULL DEFAULT 0,
  "price_paid_cents"    integer NOT NULL,
  "status"              "subscription_status" NOT NULL DEFAULT 'pending_payment',
  "purchased_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at"          timestamp with time zone,
  "razorpay_order_id"   text NOT NULL,
  "razorpay_payment_id" text,
  CONSTRAINT "user_subscriptions_razorpay_order_id_unique" UNIQUE("razorpay_order_id"),
  CONSTRAINT "user_subscriptions_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id")
);

CREATE INDEX "idx_sub_user_status" ON "user_subscriptions" ("user_id", "status");

-- Backfill: create an active subscription row for every user who already has a plan.
-- sessions_total is left NULL (recurring) and price_paid_cents 0 (unknown at migration time).
-- razorpay_order_id is synthesised from the user id so the NOT NULL + UNIQUE constraint holds.
INSERT INTO "user_subscriptions" (
  "user_id",
  "plan_id",
  "sessions_total",
  "sessions_used",
  "price_paid_cents",
  "status",
  "razorpay_order_id"
)
SELECT
  u.id,
  u.plan_id,
  p.sessions_per_month,   -- copy the plan default; null for recurring (group_live)
  0,
  0,
  'active',
  'backfill_' || u.id     -- synthetic order id; unique per user
FROM "user" u
JOIN "plans" p ON p.id = u.plan_id
WHERE u.plan_id IS NOT NULL
ON CONFLICT ("razorpay_order_id") DO NOTHING;  -- idempotent on retry

-- Remove all custom_private_* plan rows that are no longer needed.
-- These are replaced by sessionsTotal on user_subscriptions.
DELETE FROM "plans" WHERE "name" LIKE 'custom_private_%';
