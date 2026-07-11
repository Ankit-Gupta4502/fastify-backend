ALTER TABLE "workshop_user" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "utm_price_inr" integer DEFAULT 9900 NOT NULL;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "utm_price_usd" integer DEFAULT 100 NOT NULL;