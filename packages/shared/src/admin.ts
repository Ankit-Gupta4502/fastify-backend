export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  planName: string | null;
  createdAt: string;
}

export interface AdminInstructor {
  id: string;
  name: string;
  email: string;
  status: string;
  specialty: string[];
  maxConcurrentSessions: number;
  isApproved: boolean;
  sortOrder: number;
}

export interface CreateInstructorBody {
  name: string;
  email: string;
  password: string;
}

export interface AdminRoom {
  id: string;
  instructorId: string;
  instructorName: string;
  scheduledStart: string;
  scheduledEnd: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
}

export interface CreateGroupRoomBody {
  instructorId: string;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  capacity: number;
}

export interface CreateGroupRoomResult {
  roomId: string;
}
