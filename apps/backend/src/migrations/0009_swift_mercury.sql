ALTER TABLE "user" DROP CONSTRAINT "user_plan_id_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "plan_id";