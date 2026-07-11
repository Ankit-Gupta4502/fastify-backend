ALTER TABLE "workshops" ADD COLUMN "price_inr" integer;
ALTER TABLE "workshops" ADD COLUMN "price_usd" integer;
ALTER TABLE "workshops" DROP COLUMN IF EXISTS "price";
