import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { registeredWorkshops } from "./workshop.user";

export const workshops = pgTable("workshops", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  priceInr: integer("price_inr"),
  priceUsd: integer("price_usd"),
  image: text("image"),
  meetLink: text("meet_link"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  maxAttendees: integer("max_attendees").notNull().default(50),
  utmPriceInr: integer("utm_price_inr").notNull().default(9900),
  utmPriceUsd: integer("utm_price_usd").notNull().default(100),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workShopRegisteredUsers = relations(workshops, ({ many }) => ({
  registeredUsers: many(registeredWorkshops),
}));
