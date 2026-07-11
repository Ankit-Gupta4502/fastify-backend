CREATE TYPE "public"."demo_request_status" AS ENUM('pending', 'approved', 'rejected', 'needs_information', 'instructor_assigned', 'meeting_scheduled', 'completed');--> statement-breakpoint
CREATE TABLE "demo_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gender" text NOT NULL,
	"phone" text NOT NULL,
	"purposes" text[] NOT NULL,
	"other_purpose" text,
	"preferred_date" text NOT NULL,
	"preferred_time" text NOT NULL,
	"timezone" text NOT NULL,
	"utc_scheduled_at" timestamp with time zone NOT NULL,
	"assigned_instructor_id" uuid,
	"meeting_link" text,
	"meeting_platform" text,
	"status" "demo_request_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"needs_info_message" text,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_assigned_instructor_id_user_id_fk" FOREIGN KEY ("assigned_instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_demo_requests_user" ON "demo_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_demo_requests_status" ON "demo_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_demo_requests_utc" ON "demo_requests" USING btree ("utc_scheduled_at");