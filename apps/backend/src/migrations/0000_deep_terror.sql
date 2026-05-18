CREATE TYPE "public"."booking_status" AS ENUM('active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."instructor_status" AS ENUM('available', 'busy', 'offline');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('idle', 'active', 'full', 'ended');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('group', 'private');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructor_details" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"status" "instructor_status" DEFAULT 'available' NOT NULL,
	"current_room_id" uuid,
	"specialty" text[] DEFAULT '{}' NOT NULL,
	"max_concurrent_sessions" integer DEFAULT 1 NOT NULL,
	"availability_json" jsonb,
	"bio" text,
	"tagline" text,
	"profile_image_url" text,
	"avatar_key" text,
	"video_links" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"years_of_experience" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"sessions_per_week" integer,
	"allows_private" boolean DEFAULT false NOT NULL,
	"allows_time_flexibility" boolean DEFAULT false NOT NULL,
	"max_room_capacity" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "workshop_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL,
	"video_url" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "room_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"status" "booking_status" DEFAULT 'active' NOT NULL,
	"hms_peer_id" text
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "room_type" NOT NULL,
	"status" "room_status" DEFAULT 'idle' NOT NULL,
	"instructor_id" uuid NOT NULL,
	"original_instructor_id" uuid,
	"capacity" integer DEFAULT 20 NOT NULL,
	"current_occupancy" integer DEFAULT 0 NOT NULL,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"hms_room_id" text,
	"hms_room_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_hms_room_id_unique" UNIQUE("hms_room_id"),
	CONSTRAINT "current_occupancy_non_negative" CHECK ("rooms"."current_occupancy" >= 0)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session_quota_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"session_count" integer DEFAULT 1 NOT NULL,
	"counted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_quota_user_week_room" UNIQUE("user_id","week_start","room_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"image" text,
	"plan_id" uuid,
	"preferred_instructor_id" uuid,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"sessions_used_this_week" integer DEFAULT 0 NOT NULL,
	"week_reset_at" timestamp with time zone DEFAULT date_trunc('week', now()) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer,
	"image" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_details" ADD CONSTRAINT "instructor_details_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_user" ADD CONSTRAINT "workshop_user_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_users" ADD CONSTRAINT "room_users_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_users" ADD CONSTRAINT "room_users_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_original_instructor_id_user_id_fk" FOREIGN KEY ("original_instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_quota_log" ADD CONSTRAINT "session_quota_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_quota_log" ADD CONSTRAINT "session_quota_log_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_preferred_instructor_id_user_id_fk" FOREIGN KEY ("preferred_instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_instructor_status" ON "instructor_details" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_room_users_room" ON "room_users" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_room_users_user" ON "room_users" USING btree ("user_id","joined_at");--> statement-breakpoint
CREATE INDEX "idx_rooms_pool" ON "rooms" USING btree ("type","status","current_occupancy");--> statement-breakpoint
CREATE INDEX "idx_rooms_schedule" ON "rooms" USING btree ("scheduled_start");--> statement-breakpoint
CREATE INDEX "idx_quota_user_week" ON "session_quota_log" USING btree ("user_id","week_start");