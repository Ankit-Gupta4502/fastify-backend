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
    MY_PROFILE: "/instructor/profile",
  },
  UPLOADS: {
    ATTACHMENT: "/uploads/attachment",
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
  ADMIN: {
    USERS: "/admin/users",
    INSTRUCTORS: "/admin/instructors",
    APPROVE_INSTRUCTOR: (id: string) => `/admin/instructors/${id}/approve`,
    GROUP_ROOMS: "/admin/rooms/group",
  },
  WORKSHOPS: {
    LIST: "/workshops",
    DETAIL: (id: string) => `/workshops/${id}`,
    JOIN: (id: string) => `/workshops/${id}/join`,
    ADMIN_LIST: "/admin/workshops",
    ADMIN_CREATE: "/admin/workshops",
    ADMIN_UPDATE: (id: string) => `/admin/workshops/${id}`,
    ADMIN_DELETE: (id: string) => `/admin/workshops/${id}`,
  },
  SYSTEM: {
    HEALTH: "/health",
  },
} as const;
