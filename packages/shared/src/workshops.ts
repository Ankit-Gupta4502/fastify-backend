export interface Workshop {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string | null;
  meetLink: string | null;
  scheduledAt: string | null;
  maxAttendees: number;
  attendeeCount: number;
}

export interface AdminWorkshop extends Workshop {
  isActive: boolean;
  createdAt: string;
}

export interface WorkshopJoinBody {
  name: string;
  email: string;
}

export interface CreateWorkshopBody {
  name: string;
  description: string;
  price?: number | null;
  image?: string | null;
  meetLink?: string | null;
  scheduledAt?: string | null;
  maxAttendees?: number;
  isActive?: boolean;
}

export interface UpdateWorkshopBody {
  name?: string;
  description?: string;
  price?: number | null;
  image?: string | null;
  meetLink?: string | null;
  scheduledAt?: string | null;
  maxAttendees?: number;
  isActive?: boolean;
}
