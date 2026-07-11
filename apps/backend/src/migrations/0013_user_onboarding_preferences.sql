CREATE TABLE "user_preferences" (
  "user_id" uuid PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
  "gender" text NOT NULL,
  "phone" text,
  "purposes" text[] NOT NULL DEFAULT '{}',
  "other_purpose" text,
  "preferred_time_of_day" text,
  "timezone" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
