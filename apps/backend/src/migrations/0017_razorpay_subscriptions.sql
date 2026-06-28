ALTER TABLE "plans" ADD COLUMN "razorpay_plan_id_usd" text;
ALTER TABLE "plans" ADD COLUMN "razorpay_plan_id_inr" text;
ALTER TABLE "user_subscriptions" ADD COLUMN "razorpay_subscription_id" text;
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id");
ALTER TABLE "user_subscriptions" ALTER COLUMN "razorpay_order_id" DROP NOT NULL;
