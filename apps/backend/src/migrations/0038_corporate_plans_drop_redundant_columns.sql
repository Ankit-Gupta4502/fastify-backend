ALTER TABLE "corporate_plans" ALTER COLUMN "linked_plan_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "corporate_plans" DROP COLUMN "sessions_per_week";--> statement-breakpoint
ALTER TABLE "corporate_plans" DROP COLUMN "sessions_per_month";--> statement-breakpoint
ALTER TABLE "corporate_plans" DROP COLUMN "allows_private";--> statement-breakpoint
ALTER TABLE "corporate_plans" DROP COLUMN "max_room_capacity";