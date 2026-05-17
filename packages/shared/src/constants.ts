export const APP_NAME = "Yoga App";

export const DEFAULT_BACKEND_PORT = 8080;
export const DEFAULT_FRONTEND_PORT = 3000;

// Helper to check for production environment
const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";

export const DEFAULT_BACKEND_URL = isProd
  ? (typeof process !== "undefined" ? `${process.env.PROD_BASE_URL}/api` : undefined) || `http://localhost:${DEFAULT_BACKEND_PORT}`
  : `http://localhost:${DEFAULT_BACKEND_PORT}`;

export const DEFAULT_FRONTEND_URL = isProd
  ? (typeof process !== "undefined" ? process.env.PROD_FRONTEND_URL : undefined) || `http://localhost:${DEFAULT_FRONTEND_PORT}`
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
