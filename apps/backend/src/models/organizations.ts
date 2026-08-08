import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { coupons } from "./coupons";
import { organizationMembers } from "./organization-members";
import { organizationSubscriptions } from "./organization-subscriptions";
import { rooms } from "./rooms";

// Kept in sync by hand with ORGANIZATION_SIZE_BANDS in packages/shared/src/constants.ts
// (same duplication pattern already used for USER_ROLES vs constants/roles.ts —
// importing "@yoga-app/shared" directly into a drizzle model file breaks
// drizzle-kit's CJS module resolution for this workspace package).
export const organizationSizeBandEnum = pgEnum("organization_size_band", [
  "5-10",
  "10-50",
  "50-100",
  "100+",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  sizeBand: organizationSizeBandEnum("size_band").notNull(),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => user.id),
  // Set by a platform admin once sales has negotiated terms — until then the
  // org's billing page stays locked (no seat purchases, no coupon).
  billingApprovedAt: timestamp("billing_approved_at", { withTimezone: true }),
  // Negotiated per-seat price for this org specifically — replaces any
  // generic volume-tier formula, since sales negotiates each deal directly.
  pricePerSeatCents: integer("price_per_seat_cents"),
  pricePerSeatInrPaise: integer("price_per_seat_inr_paise"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    createdBy: one(user, {
      fields: [organizations.createdByUserId],
      references: [user.id],
    }),
    members: many(organizationMembers),
    subscriptions: many(organizationSubscriptions),
    coupons: many(coupons),
    rooms: many(rooms),
  }),
);
