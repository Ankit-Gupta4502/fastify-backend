import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationSubscriptions } from "./organization-subscriptions";

// Global volume-discount bands (not per-organization) — e.g. "5-10", "10-50".
// `label` is free-text (not the organizations.size_band enum) so tiers can be
// re-bucketed independently of how an org described its size at signup.
export const corporateSeatTiers = pgTable("corporate_seat_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull().unique(),
  minSeats: integer("min_seats").notNull(),
  maxSeats: integer("max_seats"), // null = open-ended (e.g. "100+")
  discountPercent: integer("discount_percent").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const corporateSeatTiersRelations = relations(
  corporateSeatTiers,
  ({ many }) => ({
    subscriptions: many(organizationSubscriptions),
  }),
);
