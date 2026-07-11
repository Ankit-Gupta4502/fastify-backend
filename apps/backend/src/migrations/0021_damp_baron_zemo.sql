ALTER TABLE "workshop_user" ADD COLUMN "razorpay_order_id" text;--> statement-breakpoint
ALTER TABLE "workshop_user" ADD COLUMN "razorpay_payment_id" text;--> statement-breakpoint
ALTER TABLE "workshop_user" ADD COLUMN "price_paid" integer;--> statement-breakpoint
ALTER TABLE "workshop_user" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "workshop_user" ADD CONSTRAINT "workshop_user_razorpay_order_id_unique" UNIQUE("razorpay_order_id");