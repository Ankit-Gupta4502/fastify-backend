import { desc, eq } from "drizzle-orm";
import { drizzle } from "../db";
import { plans, referralRewards, user, userSubscriptions } from "../schema/schema";
import {
  REFERRAL_REWARD_PLAN_NAME,
  REFERRAL_REWARD_SESSION_COUNT,
} from "../constants/referral";
import { buildReferralLink, generateReferralCode } from "../utils/referral.utils";
import { sendReferralRewardEmail } from "./referral-email.service";

// Loggers passed in from call sites are pino-shaped (request.log); default to
// console so this module works from contexts without a Fastify request too.
interface MinimalLogger {
  info: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
}

const consoleLogger: MinimalLogger = {
  info: (obj, msg) => console.log(msg ?? "", obj),
  warn: (obj, msg) => console.warn(msg ?? "", obj),
  error: (obj, msg) => console.error(msg ?? "", obj),
};

const CODE_GENERATION_ATTEMPTS = 5;

/**
 * Returns the user's existing referral code, generating and persisting one on
 * first call. Retries on the rare unique-collision case.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const [existing] = await drizzle
    .select({ referralCode: user.referralCode })
    .from(user)
    .where(eq(user.id, userId));

  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = generateReferralCode();
    try {
      await drizzle.update(user).set({ referralCode: code }).where(eq(user.id, userId));
      return code;
    } catch (err) {
      if (attempt === CODE_GENERATION_ATTEMPTS - 1) throw err;
    }
  }

  throw new Error("Failed to generate a unique referral code");
}

export async function resolveReferrerByCode(
  code: string,
): Promise<{ id: string; name: string } | null> {
  const [referrer] = await drizzle
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.referralCode, code))
    .limit(1);

  return referrer ?? null;
}

/**
 * Grants the referrer 2 free private-plan sessions the first time a referred
 * user's payment activates — safe to call from multiple activation paths
 * (webhook + client verify) for the same purchase, since the unique
 * constraint on referralRewards.referredUserId makes this idempotent.
 */
export async function rewardReferrerIfEligible(
  referredUserId: string,
  logger: MinimalLogger = consoleLogger,
): Promise<void> {
  const [referredUser] = await drizzle
    .select({ referredByUserId: user.referredByUserId })
    .from(user)
    .where(eq(user.id, referredUserId));

  if (!referredUser?.referredByUserId) return;

  const referrerId = referredUser.referredByUserId;

  const [insertedReward] = await drizzle
    .insert(referralRewards)
    .values({ referrerId, referredUserId, status: "pending" })
    .onConflictDoNothing({ target: referralRewards.referredUserId })
    .returning({ id: referralRewards.id });

  // No row inserted — a reward for this referred user already exists (or is
  // in-flight from a racing caller). Nothing more to do.
  if (!insertedReward) return;

  const [privatePlan] = await drizzle
    .select({ id: plans.id })
    .from(plans)
    .where(eq(plans.name, REFERRAL_REWARD_PLAN_NAME))
    .limit(1);

  if (!privatePlan) {
    logger.error(
      { referrerId, referredUserId, rewardId: insertedReward.id },
      "referral: reward plan 'private' not found — reward left pending, needs manual follow-up",
    );
    return;
  }

  const [grantedSubscription] = await drizzle
    .insert(userSubscriptions)
    .values({
      userId: referrerId,
      planId: privatePlan.id,
      sessionsTotal: REFERRAL_REWARD_SESSION_COUNT,
      sessionsUsed: 0,
      pricePaidCents: 0,
      status: "active",
      expiresAt: null,
    })
    .returning({ id: userSubscriptions.id });

  await drizzle
    .update(referralRewards)
    .set({
      status: "rewarded",
      sessionsGranted: REFERRAL_REWARD_SESSION_COUNT,
      grantedSubscriptionId: grantedSubscription.id,
      rewardedAt: new Date(),
    })
    .where(eq(referralRewards.id, insertedReward.id));

  logger.info({ referrerId, referredUserId }, "referral: reward granted");

  const [referrer] = await drizzle
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, referrerId));

  const [referred] = await drizzle
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, referredUserId));

  if (referrer) {
    try {
      await sendReferralRewardEmail({
        referrerName: referrer.name,
        referrerEmail: referrer.email,
        referredUserName: referred?.name ?? "Your friend",
      });
    } catch (err) {
      logger.error({ err, referrerId }, "referral: failed to send reward email");
    }
  }
}

export interface ReferredUserSummary {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  status: "signed_up" | "pending" | "rewarded";
}

export interface ReferralDashboard {
  referralCode: string;
  referralLink: string;
  referredCount: number;
  rewardedCount: number;
  referredUsers: ReferredUserSummary[];
}

/**
 * Everything a user's "my referrals" dashboard screen needs in one call.
 */
export async function getReferralDashboard(userId: string): Promise<ReferralDashboard> {
  const referralCode = await ensureReferralCode(userId);

  const rows = await drizzle
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt,
      rewardStatus: referralRewards.status,
    })
    .from(user)
    .leftJoin(referralRewards, eq(referralRewards.referredUserId, user.id))
    .where(eq(user.referredByUserId, userId))
    .orderBy(desc(user.createdAt));

  const referredUsers: ReferredUserSummary[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    joinedAt: row.joinedAt,
    status: row.rewardStatus ?? "signed_up",
  }));

  return {
    referralCode,
    referralLink: buildReferralLink(referralCode),
    referredCount: referredUsers.length,
    rewardedCount: referredUsers.filter((u) => u.status === "rewarded").length,
    referredUsers,
  };
}
