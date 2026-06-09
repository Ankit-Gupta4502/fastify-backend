export type DemoRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_information"
  | "instructor_assigned"
  | "meeting_scheduled"
  | "completed";

export type DemoGender = "Male" | "Female" | "Other";

export type DemoPurpose =
  | "Pregnancy"
  | "Stress Relief"
  | "Anxiety Management"
  | "Flexibility Improvement"
  | "Weight Loss"
  | "Back Pain Relief"
  | "Better Sleep"
  | "General Fitness"
  | "Other";

export type MeetingPlatform = "google_meet" | "zoom" | "teams";

export interface CreateDemoRequestBody {
  gender: DemoGender;
  phone: string;
  purposes: DemoPurpose[];
  otherPurpose?: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
}

export interface UpdateDemoRequestBody {
  gender: DemoGender;
  phone: string;
  purposes: DemoPurpose[];
  otherPurpose?: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
}

export interface UpdateDemoStatusBody {
  status: "approved" | "rejected" | "needs_information";
  rejectionReason?: string;
  needsInfoMessage?: string;
  adminNotes?: string;
}

export interface AssignInstructorBody {
  instructorId: string;
}

export interface ScheduleMeetingBody {
  meetingLink: string;
  meetingPlatform: MeetingPlatform;
}

export interface ApproveWithScheduleBody {
  instructorId: string;
  meetingLink: string;
  meetingPlatform: MeetingPlatform;
  adminNotes?: string;
}

export interface MyDemoRequest {
  id: string;
  gender: DemoGender;
  phone: string;
  purposes: DemoPurpose[];
  otherPurpose: string | null;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  utcScheduledAt: string;
  status: DemoRequestStatus;
  rejectionReason: string | null;
  needsInfoMessage: string | null;
  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  assignedInstructor: { id: string; name: string } | null;
  createdAt: string;
}

export interface AdminDemoRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  gender: DemoGender;
  phone: string;
  purposes: DemoPurpose[];
  otherPurpose: string | null;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  utcScheduledAt: string;
  istTime: string;
  status: DemoRequestStatus;
  rejectionReason: string | null;
  needsInfoMessage: string | null;
  adminNotes: string | null;
  assignedInstructor: { id: string; name: string; email: string } | null;
  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  createdAt: string;
}

export interface InstructorDemoSession {
  id: string;
  userName: string;
  userEmail: string;
  phone: string;
  purposes: DemoPurpose[];
  otherPurpose: string | null;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  utcScheduledAt: string;
  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  status: DemoRequestStatus;
}

export interface CreateDemoRequestResult {
  id: string;
  status: DemoRequestStatus;
}
