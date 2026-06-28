ALTER TABLE "user_subscriptions" ALTER COLUMN "razorpay_order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "razorpay_plan_id_usd" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "razorpay_plan_id_inr" text;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "razorpay_subscription_id" text;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id");