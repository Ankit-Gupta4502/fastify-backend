CREATE TABLE "session_plan_razorpay_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"session_count" integer NOT NULL,
	"currency" text NOT NULL,
	"razorpay_plan_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_plan_razorpay_plans_razorpay_plan_id_unique" UNIQUE("razorpay_plan_id"),
	CONSTRAINT "session_plan_razorpay_plans_plan_id_session_count_currency_unique" UNIQUE("plan_id","session_count","currency")
);
--> statement-breakpoint
ALTER TABLE "session_plan_razorpay_plans" ADD CONSTRAINT "session_plan_razorpay_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;