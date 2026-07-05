export type RoomStatus = "idle" | "active" | "full" | "ended";

/** Safe public shape — no enrolment state, no HMS tokens */
export interface PublicRoomPreview {
  id: string;
  status: RoomStatus;
  capacity: number;
  currentOccupancy: number;
  spotsLeft: number;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  canJoinLive: boolean;
  instructor: {
    name: string;
    specialty: string[];
  };
}
export type RoomType = "group" | "private";
export type BookingStatus = "active" | "completed" | "dropped";

export interface UpcomingRoom {
  id: string;
  status: RoomStatus;
  capacity: number;
  currentOccupancy: number;
  spotsLeft: number;
  scheduledStart: string;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  isEnrolled: boolean;
  /** Server-computed: true when the live-join window is open (15 min before start until end) */
  canJoinLive: boolean;
  /** Server-computed: true when scheduledEndUtc is in the past */
  isExpired: boolean;
  meetLink: string | null;
  instructor: {
    id: string;
    name: string;
    specialty: string[];
  };
}

export interface EnrolRoomResult {
  roomId: string;
}

export interface JoinRoomResult {
  roomId: string;
  hmsRoomCode: string | null;
}

export interface LeaveRoomResult {
  roomId: string;
  leftAt: string;
}

export interface BookPrivateResult {
  roomId: string;
}

export interface PrivateSessionSlot {
  startUtc: string;
  endUtc: string;
}

export interface RequestPrivateSessionBody {
  slots: PrivateSessionSlot[];
}

export interface RequestPrivateSessionResult {
  requestId: string;
}

export interface MyPrivateSessionRequest {
  id: string;
  requestedStart: string;
  requestedEnd: string;
  preferredSlots: PrivateSessionSlot[];
  status: "pending" | "approved" | "rejected";
  instructorName: string | null;
  roomId: string | null;
  createdAt: string;
}

export interface InstructorScheduleRoom {
  id: string;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  currentOccupancy: number;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  scheduledStart: string;
  scheduledEnd: string;
  /** Server-computed: true when the live-join window is open (15 min before start until end) */
  canJoinLive: boolean;
  /** Server-computed: true when scheduledEndUtc is in the past */
  isExpired: boolean;
  meetLink: string | null;
  adminNote: string | null;
}
