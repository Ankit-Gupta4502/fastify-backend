import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationSubscriptions } from "./organization-subscriptions";
import { plans } from "./plans";

// The actual session/capacity spec (sessionsPerWeek, maxRoomCapacity, etc.) is
// owned by the individual `plans` table, not duplicated here — a sponsored
// seat gets an ordinary userSubscriptions row against `linkedPlanId`, so all
// existing active-plan/session-pool logic keeps working unchanged. Per-seat
// pricing lives on `organizations` instead (negotiated per org by sales), not
// here — this table is purely "which underlying plan does a seat grant."
export const corporatePlans = pgTable("corporate_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  linkedPlanId: uuid("linked_plan_id")
    .notNull()
    .references(() => plans.id),
  billingInterval: text("billing_interval").notNull().default("month"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const corporatePlansRelations = relations(
  corporatePlans,
  ({ one, many }) => ({
    linkedPlan: one(plans, {
      fields: [corporatePlans.linkedPlanId],
      references: [plans.id],
    }),
    subscriptions: many(organizationSubscriptions),
  }),
);
