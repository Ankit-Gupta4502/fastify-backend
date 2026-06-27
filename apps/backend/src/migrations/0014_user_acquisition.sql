CREATE TABLE "user_acquisition" (
  "user_id" uuid PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
  "utm_source"   text,
  "utm_medium"   text,
  "utm_campaign" text,
  "utm_content"  text,
  "utm_term"     text,
  "referrer"     text,
  "landing_page" text,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now()
);
