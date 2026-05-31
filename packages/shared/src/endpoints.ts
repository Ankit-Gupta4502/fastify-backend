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
    PUBLIC_PREVIEW: "/rooms/public/preview",
    UPCOMING_GROUP: "/rooms/group/upcoming",
    ENROL: (id: string) => `/rooms/${id}/enrol`,
    JOIN: (id: string) => `/rooms/${id}/join`,
    LEAVE: (id: string) => `/rooms/${id}/leave`,
    BOOK_PRIVATE: "/rooms/private/book",
  },
  REVIEWS: {
    PUBLIC: "/reviews",
  },
  INSTRUCTORS: {
    LIST: "/instructors",
    EXPERT_PROFILE: (id: string) => `/instructor/${id}/profile`,
    MY_SCHEDULE: "/instructor/schedule",
    MY_PROFILE: "/instructor/profile",
    MY_WALLET: "/instructor/wallet",
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
    CREATE_CUSTOM_ORDER: "/payments/custom-order",
    VERIFY: "/payments/verify",
  },
  ADMIN: {
    USERS: "/admin/users",
    INSTRUCTORS: "/admin/instructors",
    APPROVE_INSTRUCTOR: (id: string) => `/admin/instructors/${id}/approve`,
    UPDATE_INSTRUCTOR_PRIORITY: (id: string) => `/admin/instructors/${id}/priority`,
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
