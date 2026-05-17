import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DEFAULT_BACKEND_PORT, DEFAULT_FRONTEND_URL } from "@yoga-app/shared";
import { drizzle } from "../db";
import * as schema from "../schema/schema";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/roles";

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
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  emailAndPassword: {
    enabled: true,
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
