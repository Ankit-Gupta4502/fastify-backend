export const APP_NAME = "Book Your Yoga Teacher";

export const DEFAULT_BACKEND_PORT = 8080;
export const DEFAULT_FRONTEND_PORT = 3000;

/**
 * Robust URL resolver that works across:
 * 1. Vite build time (Browser)
 * 2. Node runtime (Backend)
 * 3. Nitro runtime (SSR)
 */
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  // @ts-ignore - Handle Vite's import.meta.env if available during bundling
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const isProd = getEnvVar("NODE_ENV") === "production";

export const DEFAULT_BACKEND_URL = isProd
  ? getEnvVar("VITE_API_BASE_URL") || getEnvVar("PROD_BASE_URL") || `http://localhost:${DEFAULT_BACKEND_PORT}`
  : `http://localhost:${DEFAULT_BACKEND_PORT}`;

export const DEFAULT_FRONTEND_URL = isProd
  ? getEnvVar("VITE_FRONTEND_URL") || getEnvVar("PROD_FRONTEND_URL") || `http://localhost:${DEFAULT_FRONTEND_PORT}`
  : `http://localhost:${DEFAULT_FRONTEND_PORT}`;

export const USER_ROLES = {
  USER: "user",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);
export const PUBLIC_USER_ROLE_VALUES = [
  USER_ROLES.USER,
  USER_ROLES.INSTRUCTOR,
] as const;
