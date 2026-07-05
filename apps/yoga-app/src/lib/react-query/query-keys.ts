export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  system: {
    all: ["system"] as const,
    health: () => [...queryKeys.system.all, "health"] as const,
  },
  rooms: {
    all: ["rooms"] as const,
    upcoming: () => [...queryKeys.rooms.all, "upcoming"] as const,
    publicPreview: () => [...queryKeys.rooms.all, "public-preview"] as const,
    privateRequests: () => [...queryKeys.rooms.all, "private-requests"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    public: () => [...queryKeys.reviews.all, "public"] as const,
  },
  instructors: {
    all: ["instructors"] as const,
    list: (filters?: { status?: string; specialty?: string }) =>
      [...queryKeys.instructors.all, "list", filters ?? {}] as const,
    mySchedule: () => [...queryKeys.instructors.all, "my-schedule"] as const,
    expertProfile: (id: string) => [...queryKeys.instructors.all, "expert-profile", id] as const,
    myProfile: () => [...queryKeys.instructors.all, "my-profile"] as const,
    myWallet: () => [...queryKeys.instructors.all, "my-wallet"] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: () => [...queryKeys.plans.all, "list"] as const,
    mine: () => [...queryKeys.plans.all, "mine"] as const,
  },
  admin: {
    all: ["admin"] as const,
    users: (filters?: { search?: string; role?: string; plan?: string }) =>
      [...queryKeys.admin.all, "users", filters ?? {}] as const,
    userDetail: (id: string) => [...queryKeys.admin.all, "users", id] as const,
    instructors: () => [...queryKeys.admin.all, "instructors"] as const,
    groupRooms: () => [...queryKeys.admin.all, "group-rooms"] as const,
    privateRequests: () => [...queryKeys.admin.all, "private-requests"] as const,
    workshops: () => [...queryKeys.admin.all, "workshops"] as const,
  },
  workshops: {
    all: ["workshops"] as const,
    list: () => [...queryKeys.workshops.all, "list"] as const,
    detail: (id: string) => [...queryKeys.workshops.all, "detail", id] as const,
  },
  userPreferences: {
    all: ["user-preferences"] as const,
    mine: () => [...queryKeys.userPreferences.all, "mine"] as const,
  },
  demo: {
    all: ["demo"] as const,
    myRequests: () => [...queryKeys.demo.all, "my-requests"] as const,
    adminList: () => [...queryKeys.demo.all, "admin-list"] as const,
    adminDetail: (id: string) => [...queryKeys.demo.all, "admin-detail", id] as const,
    instructorSessions: () => [...queryKeys.demo.all, "instructor-sessions"] as const,
  },
  contact: {
    all: ["contact"] as const,
    adminList: () => [...queryKeys.contact.all, "admin-list"] as const,
  },
} as const;
