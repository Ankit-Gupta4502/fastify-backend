export interface AdminUserPreferences {
  gender: string;
  phone: string | null;
  purposes: string[];
  otherPurpose: string | null;
  preferredTimeOfDay: string | null;
  timezone: string;
}

export interface AdminUserAcquisition {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  landingPage: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  planName: string | null;
  createdAt: string;
  preferences: AdminUserPreferences | null;
  acquisition: AdminUserAcquisition | null;
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
  meetLink: string | null;
}

export interface CreateGroupRoomBody {
  instructorId: string;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  capacity: number;
  meetLink?: string | null;
}

export interface CreateGroupRoomResult {
  roomId: string;
}
