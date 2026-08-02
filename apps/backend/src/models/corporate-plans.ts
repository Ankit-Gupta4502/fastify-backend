import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationSubscriptions } from "./organization-subscriptions";
import { plans } from "./plans";

// The actual session/capacity spec (sessionsPerWeek, maxRoomCapacity, etc.) is
// owned by the individual `plans` table, not duplicated here — a sponsored
// seat gets an ordinary userSubscriptions row against `linkedPlanId`, so all
// existing active-plan/session-pool logic keeps working unchanged. This
// table only adds the corporate-specific bulk-seat pricing on top.
export const corporatePlans = pgTable("corporate_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  linkedPlanId: uuid("linked_plan_id")
    .notNull()
    .references(() => plans.id),
  // Per-seat base price before the seat-tier volume discount is applied.
  basePricePerSeatCents: integer("base_price_per_seat_cents"),
  basePricePerSeatInrPaise: integer("base_price_per_seat_inr_paise"),
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
