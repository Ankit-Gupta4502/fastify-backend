export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    SESSION: "/auth/session",
    GOOGLE: "/auth/google",
  },
  USER: {
    DETAIL: "/user/detail",
  },
  SYSTEM: {
  HEALTH: "/health",
  },
} as const;
