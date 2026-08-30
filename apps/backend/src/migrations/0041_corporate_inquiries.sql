CREATE TABLE "corporate_inquiries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "company_name" text NOT NULL,
  "team_size" text NOT NULL,
  "phone" text,
  "wellness_goal" text NOT NULL,
  "status" "contact_query_status" DEFAULT 'new' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_corporate_inquiries_status" ON "corporate_inquiries" USING btree ("status");
CREATE INDEX "idx_corporate_inquiries_created_at" ON "corporate_inquiries" USING btree ("created_at");
