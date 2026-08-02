// Mirrors REFERRAL_COOKIE_NAME (constants/referral.ts) — carries the chosen
// org name/size band across the Google OAuth redirect round trip, since it
// can't otherwise survive from the initial /auth/google request to the
// databaseHooks.user.create.after hook that fires once the callback lands.
export const PENDING_ORG_COOKIE_NAME = "byyt_pending_org";
export const PENDING_ORG_COOKIE_MAX_AGE_SECONDS = 600;

// Same idea, for a pending invite-token acceptance across the OAuth redirect
// (a NEW user signing up via an invite link, as opposed to creating an org).
export const PENDING_ORG_INVITE_COOKIE_NAME = "byyt_pending_org_invite";
export const PENDING_ORG_INVITE_COOKIE_MAX_AGE_SECONDS = 600;

// Site-wide discount % for org members who self-pay instead of using a
// sponsored seat — one fixed rate for every organization (not negotiated).
export const CORPORATE_SELF_PAY_DISCOUNT_PERCENT = 10;
