export const USER_ROLES = {
  USER: "user",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);

export function isUserRole(value: string): value is UserRole {
  return USER_ROLE_VALUES.includes(value as UserRole);
}

export const DEFAULT_USER_ROLE: UserRole = USER_ROLES.USER;
