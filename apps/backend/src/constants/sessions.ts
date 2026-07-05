export const INSTRUCTOR_STATUS = {
  AVAILABLE: "available",
  BUSY: "busy",
  OFFLINE: "offline",
} as const;

export type InstructorStatus =
  (typeof INSTRUCTOR_STATUS)[keyof typeof INSTRUCTOR_STATUS];

export const INSTRUCTOR_STATUS_VALUES = Object.values(
  INSTRUCTOR_STATUS,
) as InstructorStatus[];

export const ROOM_TYPE = {
  GROUP: "group",
  PRIVATE: "private",
} as const;

export type RoomType = (typeof ROOM_TYPE)[keyof typeof ROOM_TYPE];

export const ROOM_TYPE_VALUES = Object.values(ROOM_TYPE) as RoomType[];

export const ROOM_STATUS = {
  IDLE: "idle",
  ACTIVE: "active",
  FULL: "full",
  ENDED: "ended",
  CANCELLED: "cancelled",
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export const ROOM_STATUS_VALUES = Object.values(ROOM_STATUS) as RoomStatus[];

export const BOOKING_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DROPPED: "dropped",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_VALUES = Object.values(
  BOOKING_STATUS,
) as BookingStatus[];

export const PLAN_NAME = {
  GROUP_LIVE: "group_live",
  PRIVATE: "private",
  ON_DEMAND: "on_demand",
} as const;

export type PlanName = (typeof PLAN_NAME)[keyof typeof PLAN_NAME];

export const DEFAULT_USER_TIMEZONE = "UTC";
export const INSTRUCTOR_TIMEZONE = "Asia/Kolkata";

// Earnings credited to the instructor's wallet after each completed session (in paise)
export const SESSION_EARNING_PAISE = 40_000; // 400 INR
