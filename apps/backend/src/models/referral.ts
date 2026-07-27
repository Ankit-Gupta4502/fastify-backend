import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { userSubscriptions } from "./user-subscription";

export const referralRewardStatusEnum = pgEnum("referral_reward_status", [
  "pending",
  "rewarded",
]);

export const referralRewards = pgTable(
  "referral_rewards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Unique — one reward per referred person, ever. Also the idempotency guard
    // used by rewardReferrerIfEligible when called from both the webhook and
    // the client-side payment verify endpoint for the same first purchase.
    referredUserId: uuid("referred_user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    status: referralRewardStatusEnum("status").notNull().default("pending"),
    sessionsGranted: integer("sessions_granted").notNull().default(0),
    grantedSubscriptionId: uuid("granted_subscription_id").references(
      () => userSubscriptions.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    rewardedAt: timestamp("rewarded_at", { withTimezone: true }),
  },
  (t) => [index("idx_referral_rewards_referrer").on(t.referrerId)],
);

export const referralRewardsRelations = relations(
  referralRewards,
  ({ one }) => ({
    referrer: one(user, {
      relationName: "referralRewardsAsReferrer",
      fields: [referralRewards.referrerId],
      references: [user.id],
    }),
    referredUser: one(user, {
      relationName: "referralRewardsAsReferred",
      fields: [referralRewards.referredUserId],
      references: [user.id],
    }),
    grantedSubscription: one(userSubscriptions, {
      fields: [referralRewards.grantedSubscriptionId],
      references: [userSubscriptions.id],
    }),
  }),
);
