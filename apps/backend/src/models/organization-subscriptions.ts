import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { corporatePlans } from "./corporate-plans";
import { corporateSeatTiers } from "./corporate-seat-tiers";
import { organizations } from "./organizations";

// Separate from user_subscriptions' status enum on purpose — this table's
// status tracks the bulk seat purchase (the parent Razorpay subscription),
// not any individual member's access.
export const organizationSubscriptionStatusEnum = pgEnum(
  "organization_subscription_status",
  ["pending_payment", "active", "expired", "cancelled"],
);

// One row per bulk seat purchase ("top-ups" create a new row rather than
// mutating an existing one — see plan doc for the no-proration rationale).
export const organizationSubscriptions = pgTable("organization_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  corporatePlanId: uuid("corporate_plan_id")
    .notNull()
    .references(() => corporatePlans.id),
  seatTierId: uuid("seat_tier_id")
    .notNull()
    .references(() => corporateSeatTiers.id),
  seatsPurchased: integer("seats_purchased").notNull(),
  pricePaidTotalCents: integer("price_paid_total_cents"),
  pricePaidTotalInrPaise: integer("price_paid_total_inr_paise"),
  currency: text("currency"),
  status: organizationSubscriptionStatusEnum("status")
    .notNull()
    .default("pending_payment"),
  razorpaySubscriptionId: text("razorpay_subscription_id").unique(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const organizationSubscriptionsRelations = relations(
  organizationSubscriptions,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationSubscriptions.organizationId],
      references: [organizations.id],
    }),
    corporatePlan: one(corporatePlans, {
      fields: [organizationSubscriptions.corporatePlanId],
      references: [corporatePlans.id],
    }),
    seatTier: one(corporateSeatTiers, {
      fields: [organizationSubscriptions.seatTierId],
      references: [corporateSeatTiers.id],
    }),
  }),
);
