ALTER TABLE "reviews" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "reviewer_name" text;
