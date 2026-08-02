import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const couponTypeEnum = pgEnum("coupon_type", ["percent", "flat"]);
export const couponScopeEnum = pgEnum("coupon_scope", [
  "global",
  "organization",
]);

// Generic, reusable discount-code engine — organization coupons are one
// scope of this, not corporate-only plumbing.
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  // percent: 0-100. flat: smallest currency unit (cents/paise), interpreted
  // against whatever currency the checkout is charging in.
  value: integer("value").notNull(),
  scope: couponScopeEnum("scope").notNull().default("global"),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const couponsRelations = relations(coupons, ({ one }) => ({
  organization: one(organizations, {
    fields: [coupons.organizationId],
    references: [organizations.id],
  }),
}));
