export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    SESSION: "/auth/session",
    GOOGLE: "/auth/google",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    DETAIL: "/user/detail",
    PREFERENCES: "/user/preferences",
    ACQUISITION: "/user/acquisition",
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
    REVIEWS: "/admin/reviews",
    REVIEW: (id: string) => `/admin/reviews/${id}`,
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
  DEMO: {
    CREATE_REQUEST: "/demo/request",
    MY_REQUESTS: "/demo/my-requests",
    UPDATE_MY_REQUEST: (id: string) => `/demo/my-requests/${id}`,
    ADMIN_LIST: "/admin/demo-requests",
    ADMIN_DETAIL: (id: string) => `/admin/demo-requests/${id}`,
    ADMIN_UPDATE_STATUS: (id: string) => `/admin/demo-requests/${id}/status`,
    ADMIN_ASSIGN_INSTRUCTOR: (id: string) =>
      `/admin/demo-requests/${id}/assign-instructor`,
    ADMIN_SCHEDULE_MEETING: (id: string) =>
      `/admin/demo-requests/${id}/meeting`,
    ADMIN_APPROVE: (id: string) => `/admin/demo-requests/${id}/approve`,
    INSTRUCTOR_SESSIONS: "/instructor/demo-sessions",
  },
  SYSTEM: {
    HEALTH: "/health",
  },
} as const;
