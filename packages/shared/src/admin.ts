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
  name: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  meetLink: string | null;
}

export interface CreateGroupRoomBody {
  instructorId: string;
  name?: string | null;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  capacity: number;
  // Required — group classes join via Google Meet only, no 100ms fallback room.
  meetLink: string;
}

export interface CreateGroupRoomResult {
  roomId: string;
}

export interface UpdateGroupRoomBody {
  instructorId?: string;
  name?: string | null;
  scheduledStartUtc?: string;
  scheduledEndUtc?: string;
  capacity?: number;
  meetLink?: string;
}

export type PrivateSessionRequestStatus = "pending" | "approved" | "rejected";

export interface AdminPrivateSessionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedStart: string;
  requestedEnd: string;
  preferredSlots: Array<{ startUtc: string; endUtc: string }>;
  status: PrivateSessionRequestStatus;
  instructorId: string | null;
  instructorName: string | null;
  roomId: string | null;
  adminNote: string | null;
  createdAt: string;
}

export interface AssignPrivateSessionBody {
  instructorId: string;
  adminNote?: string | null;
}

export interface AdminUserSubscription {
  id: string;
  planName: string;
  sessionsTotal: number | null;
  sessionsUsed: number;
  pricePaidCents: number;
  status: string;
  purchasedAt: string;
  expiresAt: string | null;
}

export interface AdminUserRoom {
  id: string;
  type: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  instructorName: string | null;
  meetLink: string | null;
}

export interface AdminUserPrivateRequest {
  id: string;
  requestedStart: string;
  requestedEnd: string;
  preferredSlots: Array<{ startUtc: string; endUtc: string }>;
  status: "pending" | "approved" | "rejected";
  instructorName: string | null;
  adminNote: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  subscriptions: AdminUserSubscription[];
  rooms: AdminUserRoom[];
  privateRequests: AdminUserPrivateRequest[];
}
