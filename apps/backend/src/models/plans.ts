import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { userSubscriptions } from "./user-subscription";

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  priceCents: integer("price_cents"),
  pricePerSessionCents: integer("price_per_session_cents"),
  billingInterval: text("billing_interval").notNull().default("month"),
  sessionsPerWeek: integer("sessions_per_week"),
  sessionsPerMonth: integer("sessions_per_month"),
  allowsPrivate: boolean("allows_private").notNull().default(false),
  allowsTimeFlexibility: boolean("allows_time_flexibility")
    .notNull()
    .default(false),
  maxRoomCapacity: integer("max_room_capacity"),
  priceInrPaise: integer("price_inr_paise"),
  pricePerSessionInrPaise: integer("price_per_session_inr_paise"),
  category: text("category").notNull().default("standard"),
  // Razorpay Plan IDs created lazily on first subscription — one per currency
  razorpayPlanIdUsd: text("razorpay_plan_id_usd"),
  razorpayPlanIdInr: text("razorpay_plan_id_inr"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));
