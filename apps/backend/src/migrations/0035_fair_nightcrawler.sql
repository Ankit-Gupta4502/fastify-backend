CREATE TYPE "public"."referral_reward_status" AS ENUM('pending', 'rewarded');--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_user_id" uuid NOT NULL,
	"status" "referral_reward_status" DEFAULT 'pending' NOT NULL,
	"sessions_granted" integer DEFAULT 0 NOT NULL,
	"granted_subscription_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rewarded_at" timestamp with time zone,
	CONSTRAINT "referral_rewards_referred_user_id_unique" UNIQUE("referred_user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referred_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referred_user_id_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_granted_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("granted_subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_referral_rewards_referrer" ON "referral_rewards" USING btree ("referrer_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_referred_by_user_id_user_id_fk" FOREIGN KEY ("referred_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code");