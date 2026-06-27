ALTER TABLE "workshops" ADD COLUMN "price_inr" integer;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "price_usd" integer;--> statement-breakpoint
ALTER TABLE "workshops" DROP COLUMN "price";