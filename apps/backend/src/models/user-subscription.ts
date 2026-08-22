import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { organizations } from "./organizations";
import { organizationSubscriptions } from "./organization-subscriptions";
import { plans } from "./plans";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending_payment",
  "active",
  "expired",
  "cancelled",
]);

export const userSubscriptionSourceEnum = pgEnum("user_subscription_source", [
  "individual",
  "corporate_sponsored",
  "corporate_discount",
]);

export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  // null = recurring plan (no session pool); integer = sessions purchased
  sessionsTotal: integer("sessions_total"),
  sessionsUsed: integer("sessions_used").notNull().default(0),
  pricePaidCents: integer("price_paid_cents").notNull(),
  // Currency actually charged ("USD" | "INR") — null for rows purchased before
  // this column existed, since their true currency was never persisted.
  currency: text("currency"),
  status: subscriptionStatusEnum("status").notNull().default("pending_payment"),
  purchasedAt: timestamp("purchased_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  // One of these will be set: orderId for one-time orders, subscriptionId for recurring plans
  razorpayOrderId: text("razorpay_order_id").unique(),
  razorpaySubscriptionId: text("razorpay_subscription_id").unique(),
  razorpayPaymentId: text("razorpay_payment_id").unique(),
  source: userSubscriptionSourceEnum("source").notNull().default("individual"),
  // Set only for source = corporate_sponsored / corporate_discount.
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  // Set only for source = corporate_sponsored — the bulk purchase this seat
  // was drawn from.
  organizationSubscriptionId: uuid("organization_subscription_id").references(
    () => organizationSubscriptions.id,
    { onDelete: "set null" },
  ),
});

export const userSubscriptionRelations = relations(
  userSubscriptions,
  ({ one }) => ({
    user: one(user, {
      fields: [userSubscriptions.userId],
      references: [user.id],
    }),
    plan: one(plans, {
      fields: [userSubscriptions.planId],
      references: [plans.id],
    }),
    organization: one(organizations, {
      fields: [userSubscriptions.organizationId],
      references: [organizations.id],
    }),
    organizationSubscription: one(organizationSubscriptions, {
      fields: [userSubscriptions.organizationSubscriptionId],
      references: [organizationSubscriptions.id],
    }),
  }),
);
