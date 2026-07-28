import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DEFAULT_BACKEND_PORT, DEFAULT_FRONTEND_URL } from "@yoga-app/shared";
import { drizzle } from "../db";
import * as schema from "../schema/schema";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/roles";
import { REFERRAL_COOKIE_NAME } from "../constants/referral";
import { EmailService } from "../services/EmailService";
import { resolveReferrerByCode } from "../services/referral.service";
import { config } from "../config";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  `http://localhost:${process.env.PORT || DEFAULT_BACKEND_PORT}`;

export const auth = betterAuth({
  database: drizzleAdapter(drizzle, {
    provider: "pg",
    schema,
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
    baseURL,
  ],
  user: {
    additionalFields: {
      role: {
        type: USER_ROLE_VALUES,
        required: true,
        defaultValue: USER_ROLES.USER,
        input: true,
      },
      // Set once at signup from the referral code in the register request.
      referredByUserId: {
        type: "string",
        required: false,
        input: true,
      },
      // Server-generated shareable code (referral.service.ts) — never client input.
      referralCode: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies:false,
    database: {
      generateId: "uuid",
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Attaches the referrer for social sign-ups (email/password registration
        // already sets referredByUserId explicitly via the /auth/register body).
        // The referral code can't travel through the OAuth redirect as a query
        // param, so the frontend stashes it in a cookie before redirecting to
        // the provider, and we read it back here right before the row is inserted.
        before: async (newUser, ctx) => {
          if (newUser.referredByUserId) return;
          // Only trust the cookie for user rows created by the OAuth callback
          // itself — otherwise a stray/planted cookie (e.g. via a cross-site
          // request to /auth/google) could silently attach a referrer to an
          // unrelated email/password signup in the same browser.
          if (ctx?.path !== "/callback/:id") return;
          const code = ctx?.getCookie(REFERRAL_COOKIE_NAME);
          if (!code) return;
          const referrer = await resolveReferrerByCode(code);
          if (referrer) return { data: { ...newUser, referredByUserId: referrer.id } };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      console.log("[auth] sendResetPassword called for", user.email, "| url:", url);
      await EmailService.sendPasswordResetEmail(user.email, user.name, url);
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  // Email verification is enforced only for role=USER — see the manual check in
  // AuthController.loginUser. Instructor/admin accounts are created out-of-band
  // (e.g. by an admin) and should never be blocked from signing in by this.
  emailVerification: {
    sendVerificationEmail: async ({ user, token }: { user: { email: string; name: string; role?: string }; token: string }) => {
      if (user.role && user.role !== USER_ROLES.USER) return;
      const url = `${config.frontend.url}/verify-email?token=${token}`;
      console.log("[auth] sendVerificationEmail called for", user.email, "| url:", url);
      await EmailService.sendVerificationEmail(user.email, user.name, url);
    },
    sendOnSignUp: true,
    expiresIn: 3600,
  },

  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
});
