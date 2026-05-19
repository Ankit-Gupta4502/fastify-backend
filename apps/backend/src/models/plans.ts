import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  priceCents: integer("price_cents").notNull(),
  billingInterval: text("billing_interval").notNull().default("month"),
  sessionsPerWeek: integer("sessions_per_week"),
  sessionsPerMonth: integer("sessions_per_month"),
  allowsPrivate: boolean("allows_private").notNull().default(false),
  allowsTimeFlexibility: boolean("allows_time_flexibility")
    .notNull()
    .default(false),
  maxRoomCapacity: integer("max_room_capacity"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plansRelations = relations(plans, ({ many }) => ({
  subscribers: many(user),
}));
