export const REFERRAL_REWARD_PLAN_NAME = "private";
export const REFERRAL_REWARD_SESSION_COUNT = 2;

// Set on the backend's own origin when a referred user starts a social sign-in
// (the referral code, a frontend query param, can't otherwise survive the
// redirect to the OAuth provider and back). Read in the `user.create`
// databaseHook (lib/auth.ts) to attach the referrer right before insert.
export const REFERRAL_COOKIE_NAME = "byyt_pending_ref";
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 600;
