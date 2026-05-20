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
  },
  instructors: {
    all: ["instructors"] as const,
    list: (filters?: { status?: string; specialty?: string }) =>
      [...queryKeys.instructors.all, "list", filters ?? {}] as const,
    mySchedule: () => [...queryKeys.instructors.all, "my-schedule"] as const,
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
    users: () => [...queryKeys.admin.all, "users"] as const,
    instructors: () => [...queryKeys.admin.all, "instructors"] as const,
    groupRooms: () => [...queryKeys.admin.all, "group-rooms"] as const,
    workshops: () => [...queryKeys.admin.all, "workshops"] as const,
  },
  workshops: {
    all: ["workshops"] as const,
    list: () => [...queryKeys.workshops.all, "list"] as const,
    detail: (id: string) => [...queryKeys.workshops.all, "detail", id] as const,
  },
} as const;
