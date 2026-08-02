export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    SESSION: "/auth/session",
    GOOGLE: "/auth/google",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESEND_VERIFICATION_EMAIL: "/auth/resend-verification-email",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  USER: {
    DETAIL: "/user/detail",
    PREFERENCES: "/user/preferences",
    ACQUISITION: "/user/acquisition",
    ONBOARDING: "/user/onboarding",
  },
  ROOMS: {
    PUBLIC_PREVIEW: "/rooms/public/preview",
    UPCOMING_GROUP: "/rooms/group/upcoming",
    ENROL: (id: string) => `/rooms/${id}/enrol`,
    JOIN: (id: string) => `/rooms/${id}/join`,
    LEAVE: (id: string) => `/rooms/${id}/leave`,
    BOOK_PRIVATE: "/rooms/private/book",
    REQUEST_PRIVATE: "/rooms/private/request",
    MY_PRIVATE_REQUESTS: "/rooms/private/my-requests",
  },
  REVIEWS: {
    PUBLIC: "/reviews",
  },
  INSTRUCTORS: {
    LIST: "/instructors",
    EXPERT_PROFILE: (id: string) => `/instructor/${id}/profile`,
    MY_SCHEDULE: "/instructor/schedule",
    MY_PROFILE: "/instructor/profile",
    MY_AVAILABILITY: "/instructor/availability",
    MY_WALLET: "/instructor/wallet",
  },
  UPLOADS: {
    ATTACHMENT: "/uploads/attachment",
    VIDEO: "/uploads/video",
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
    CANCEL: "/payments/cancel",
  },
  ADMIN: {
    USERS: "/admin/users",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    INSTRUCTORS: "/admin/instructors",
    INSTRUCTOR_DETAIL: (id: string) => `/admin/instructors/${id}`,
    INSTRUCTOR_SESSION_DETAIL: (instructorId: string, roomId: string) =>
      `/admin/instructors/${instructorId}/sessions/${roomId}`,
    APPROVE_INSTRUCTOR: (id: string) => `/admin/instructors/${id}/approve`,
    UPDATE_INSTRUCTOR_PRIORITY: (id: string) => `/admin/instructors/${id}/priority`,
    UPDATE_INSTRUCTOR_STATS: (id: string) => `/admin/instructors/${id}/stats`,
    GROUP_ROOMS: "/admin/rooms/group",
    UPDATE_GROUP_ROOM: (id: string) => `/admin/rooms/group/${id}`,
    CANCEL_GROUP_ROOM: (id: string) => `/admin/rooms/group/${id}`,
    PRIVATE_REQUESTS: (status?: "pending" | "approved" | "rejected") =>
      `/admin/rooms/private-requests${status ? `?status=${status}` : ""}`,
    ASSIGN_PRIVATE_REQUEST: (id: string) => `/admin/rooms/private-requests/${id}/assign`,
    REJECT_PRIVATE_REQUEST: (id: string) => `/admin/rooms/private-requests/${id}/reject`,
    REVIEWS: "/admin/reviews",
    REVIEW: (id: string) => `/admin/reviews/${id}`,
    PLANS: "/admin/plans",
    UPDATE_PLAN: (id: string) => `/admin/plans/${id}`,
    CORPORATE_PLANS: "/admin/corporate-plans",
    UPDATE_CORPORATE_PLAN: (id: string) => `/admin/corporate-plans/${id}`,
  },
  WORKSHOPS: {
    LIST: "/workshops",
    DETAIL: (id: string) => `/workshops/${id}`,
    CREATE_ORDER: (id: string) => `/workshops/${id}/create-order`,
    JOIN: (id: string) => `/workshops/${id}/join`,
    ADMIN_LIST: "/admin/workshops",
    ADMIN_CREATE: "/admin/workshops",
    ADMIN_UPDATE: (id: string) => `/admin/workshops/${id}`,
    ADMIN_DELETE: (id: string) => `/admin/workshops/${id}`,
  },
  CONTACT: {
    SUBMIT: "/contact",
    ADMIN_LIST: "/admin/contact-queries",
    ADMIN_RESOLVE: (id: string) => `/admin/contact-queries/${id}/resolve`,
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
  REFERRALS: {
    ME: "/referrals/me",
  },
  ORGANIZATIONS: {
    MY_ORGANIZATIONS: "/organizations/me",
    INVITE_PREVIEW: (token: string) => `/organizations/invites/${token}`,
    ACCEPT_INVITE: (token: string) => `/organizations/invites/${token}/accept`,
    MEMBERS: (organizationId: string) => `/organizations/${organizationId}/members`,
    PROMOTE_MEMBER: (organizationId: string, memberId: string) =>
      `/organizations/${organizationId}/members/${memberId}/promote`,
    REMOVE_MEMBER: (organizationId: string, memberId: string) =>
      `/organizations/${organizationId}/members/${memberId}`,
    CLASSES: (organizationId: string) => `/organizations/${organizationId}/classes`,
    INVITE_MEMBERS: (organizationId: string) => `/organizations/${organizationId}/invites`,
    COUPON: (organizationId: string) => `/organizations/${organizationId}/coupon`,
    CORPORATE_PLANS: "/organizations/corporate-plans",
    SEAT_PURCHASE: (organizationId: string) => `/organizations/${organizationId}/subscriptions`,
    SEAT_PURCHASE_VERIFY: (organizationId: string) => `/organizations/${organizationId}/subscriptions/verify`,
  },
} as const;
