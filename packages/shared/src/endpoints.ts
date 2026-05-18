export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    SESSION: "/auth/session",
    GOOGLE: "/auth/google",
  },
  USER: {
    DETAIL: "/user/detail",
  },
  ROOMS: {
    UPCOMING_GROUP: "/rooms/group/upcoming",
    JOIN: (id: string) => `/rooms/${id}/join`,
    LEAVE: (id: string) => `/rooms/${id}/leave`,
    BOOK_PRIVATE: "/rooms/private/book",
  },
  INSTRUCTORS: {
    LIST: "/instructors",
    MY_SCHEDULE: "/instructor/schedule",
  },
  PLANS: {
    LIST: "/plans",          // public, no priceCents
    PRICING: "/plans/pricing", // user-only, includes priceCents
    MINE: "/plans/me",       // user-only, current subscription + quota
  },
  PAYMENTS: {
    CREATE_ORDER: "/payments/orders",
    VERIFY: "/payments/verify",
  },
  SYSTEM: {
    HEALTH: "/health",
  },
} as const;
