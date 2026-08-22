ALTER TABLE "corporate_seat_tiers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "corporate_seat_tiers" CASCADE;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "price_per_seat_cents" integer;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "price_per_seat_inr_paise" integer;--> statement-breakpoint
ALTER TABLE "corporate_plans" DROP COLUMN "base_price_per_seat_cents";--> statement-breakpoint
ALTER TABLE "corporate_plans" DROP COLUMN "base_price_per_seat_inr_paise";--> statement-breakpoint
ALTER TABLE "organization_subscriptions" DROP COLUMN "seat_tier_id";