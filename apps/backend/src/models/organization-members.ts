import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { organizations } from "./organizations";
import { userSubscriptions } from "./user-subscription";

export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
  "admin",
  "member",
]);

// Invite + membership merged into one row: a row is created in "invited"
// status (userId null) when the admin sends the invite, and transitions to
// "joined" (userId set) once the invitee signs up/logs in via the token.
export const organizationMemberStatusEnum = pgEnum(
  "organization_member_status",
  ["invited", "joined", "removed"],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    invitedEmail: text("invited_email").notNull(),
    role: organizationMemberRoleEnum("role").notNull().default("member"),
    status: organizationMemberStatusEnum("status").notNull().default("invited"),
    inviteToken: text("invite_token").unique(),
    invitedByUserId: uuid("invited_by_user_id").references(() => user.id),
    // Set when this member consumed a sponsored seat at join time (auto-fill
    // in join order, up to the org's purchased seat count).
    sponsoredUserSubscriptionId: uuid(
      "sponsored_user_subscription_id",
    ).references(() => userSubscriptions.id, { onDelete: "set null" }),
    invitedAt: timestamp("invited_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_org_members_org").on(t.organizationId),
    index("idx_org_members_user").on(t.userId),
    // NULLs (not-yet-joined invites) don't collide under this constraint —
    // it only prevents the same user joining the same org twice.
    unique("uniq_org_member_org_user").on(t.organizationId, t.userId),
  ],
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(user, {
      relationName: "organizationMembersAsUser",
      fields: [organizationMembers.userId],
      references: [user.id],
    }),
    invitedBy: one(user, {
      relationName: "organizationMembersAsInviter",
      fields: [organizationMembers.invitedByUserId],
      references: [user.id],
    }),
    sponsoredSubscription: one(userSubscriptions, {
      fields: [organizationMembers.sponsoredUserSubscriptionId],
      references: [userSubscriptions.id],
    }),
  }),
);
