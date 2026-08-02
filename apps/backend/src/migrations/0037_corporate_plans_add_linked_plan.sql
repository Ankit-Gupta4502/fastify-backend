ALTER TABLE "corporate_plans" ALTER COLUMN "allows_private" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "corporate_plans" ADD COLUMN "linked_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "corporate_plans" ADD CONSTRAINT "corporate_plans_linked_plan_id_plans_id_fk" FOREIGN KEY ("linked_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;