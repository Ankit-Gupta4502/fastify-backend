export type InstructorStatus = "available" | "busy" | "offline";

export interface InstructorListItem {
  id: string;
  name: string;
  email: string;
  status: InstructorStatus;
  specialty: string[];
  currentRoomId: string | null;
  profileImageUrl: string | null;
  tagline: string | null;
  yearsOfExperience: number | null;
  rating: number;
}

export interface InstructorProfile {
  name: string;
  email: string;
  image: string | null;
  status: InstructorStatus;
  specialty: string[];
  bio: string | null;
  tagline: string | null;
  profileImageUrl: string | null;
  avatarKey: string | null;
  introVideoUrl: string | null;
  introVideoKey: string | null;
  tags: string[];
  yearsOfExperience: number | null;
}

export interface PublicInstructorProfile {
  id: string;
  name: string;
  image: string | null;
  status: InstructorStatus;
  specialty: string[];
  currentRoomId: string | null;
  bio: string | null;
  tagline: string | null;
  profileImageUrl: string | null;
  avatarKey: string | null;
  introVideoUrl: string | null;
  tags: string[];
  yearsOfExperience: number | null;
  rating: number;
  studentsGuided: number;
}

export interface UpdateProfileBody {
  name?: string;
  bio?: string;
  tagline?: string;
  profileImageUrl?: string | null;
  avatarKey?: string | null;
  introVideoUrl?: string | null;
  introVideoKey?: string | null;
  tags?: string[];
  yearsOfExperience?: number | null;
}

export interface WalletTransaction {
  id: string;
  amountPaise: number;
  type: "session_credit";
  description: string | null;
  roomId: string | null;
  createdAt: string;
}

export interface WalletBalance {
  balancePaise: number;
  balanceInr: number;
  transactions: WalletTransaction[];
}
