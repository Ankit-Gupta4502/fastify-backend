export type InstructorStatus = "available" | "busy" | "offline";

export interface InstructorListItem {
  id: string;
  name: string;
  email: string;
  status: InstructorStatus;
  specialty: string[];
  currentRoomId: string | null;
}
