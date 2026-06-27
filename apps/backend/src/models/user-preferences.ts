import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  gender: text("gender").notNull(),
  phone: text("phone"),
  purposes: text("purposes").array().notNull().default([]),
  otherPurpose: text("other_purpose"),
  preferredTimeOfDay: text("preferred_time_of_day"),
  timezone: text("timezone").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
