import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { plans } from "./plans";

/** Cached Razorpay Plan IDs for session-based custom plans — one per (plan, sessionCount, currency). */
export const sessionPlanRazorpayPlans = pgTable(
  "session_plan_razorpay_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id),
    sessionCount: integer("session_count").notNull(),
    currency: text("currency").notNull(),
    razorpayPlanId: text("razorpay_plan_id").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.planId, t.sessionCount, t.currency)],
);
