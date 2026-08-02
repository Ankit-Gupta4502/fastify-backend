CREATE TYPE "public"."coupon_scope" AS ENUM('global', 'organization');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('percent', 'flat');--> statement-breakpoint
CREATE TYPE "public"."organization_member_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."organization_member_status" AS ENUM('invited', 'joined', 'removed');--> statement-breakpoint
CREATE TYPE "public"."organization_size_band" AS ENUM('5-10', '10-50', '50-100', '100+');--> statement-breakpoint
CREATE TYPE "public"."organization_subscription_status" AS ENUM('pending_payment', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_subscription_source" AS ENUM('individual', 'corporate_sponsored', 'corporate_discount');--> statement-breakpoint
CREATE TABLE "corporate_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sessions_per_week" integer,
	"sessions_per_month" integer,
	"allows_private" boolean DEFAULT false NOT NULL,
	"max_room_capacity" integer,
	"base_price_per_seat_cents" integer,
	"base_price_per_seat_inr_paise" integer,
	"billing_interval" text DEFAULT 'month' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "corporate_plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "corporate_seat_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"min_seats" integer NOT NULL,
	"max_seats" integer,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "corporate_seat_tiers_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"type" "coupon_type" NOT NULL,
	"value" integer NOT NULL,
	"scope" "coupon_scope" DEFAULT 'global' NOT NULL,
	"organization_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"invited_email" text NOT NULL,
	"role" "organization_member_role" DEFAULT 'member' NOT NULL,
	"status" "organization_member_status" DEFAULT 'invited' NOT NULL,
	"invite_token" text,
	"invited_by_user_id" uuid,
	"sponsored_user_subscription_id" uuid,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"joined_at" timestamp with time zone,
	CONSTRAINT "organization_members_invite_token_unique" UNIQUE("invite_token"),
	CONSTRAINT "uniq_org_member_org_user" UNIQUE("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organization_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"corporate_plan_id" uuid NOT NULL,
	"seat_tier_id" uuid NOT NULL,
	"seats_purchased" integer NOT NULL,
	"price_paid_total_cents" integer,
	"price_paid_total_inr_paise" integer,
	"currency" text,
	"status" "organization_subscription_status" DEFAULT 'pending_payment' NOT NULL,
	"razorpay_subscription_id" text,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "organization_subscriptions_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"size_band" "organization_size_band" NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "source" "user_subscription_source" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "organization_subscription_id" uuid;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_sponsored_user_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("sponsored_user_subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_corporate_plan_id_corporate_plans_id_fk" FOREIGN KEY ("corporate_plan_id") REFERENCES "public"."corporate_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_seat_tier_id_corporate_seat_tiers_id_fk" FOREIGN KEY ("seat_tier_id") REFERENCES "public"."corporate_seat_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_org_members_org" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_org_members_user" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_organization_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("organization_subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE set null ON UPDATE no action;