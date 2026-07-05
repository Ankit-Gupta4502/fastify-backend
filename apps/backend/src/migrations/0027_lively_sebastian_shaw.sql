CREATE TYPE "public"."contact_query_status" AS ENUM('new', 'resolved');--> statement-breakpoint
CREATE TABLE "contact_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_query_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_contact_queries_status" ON "contact_queries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_contact_queries_created_at" ON "contact_queries" USING btree ("created_at");