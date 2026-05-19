export type RoomStatus = "idle" | "active" | "full" | "ended";
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
}
