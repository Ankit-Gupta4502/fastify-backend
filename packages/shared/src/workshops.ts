export interface Workshop {
  id: string;
  name: string;
  description: string;
  content: string | null;
  priceInr: number | null;
  priceUsd: number | null;
  utmPriceInr: number;
  utmPriceUsd: number;
  image: string | null;
  meetLink: string | null;
  scheduledAt: string | null;
  maxAttendees: number;
  attendeeCount: number;
  /** Resolved server-side from the visitor's detected country (IN vs rest-of-world). Only set on public list/detail responses. */
  isIndia?: boolean;
}

export interface AdminWorkshop extends Workshop {
  isActive: boolean;
  createdAt: string;
}

export interface WorkshopOrderResponse {
  orderId: string | null;
  keyId: string;
  amount: number;
  currency: "INR" | "USD";
}

export interface WorkshopJoinBody {
  utmSource?: string | null;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface CreateWorkshopBody {
  name: string;
  description: string;
  content?: string | null;
  priceInr?: number | null;
  priceUsd?: number | null;
  utmPriceInr?: number;
  utmPriceUsd?: number;
  image?: string | null;
  meetLink?: string | null;
  scheduledAt?: string | null;
  maxAttendees?: number;
  isActive?: boolean;
}

export interface UpdateWorkshopBody {
  name?: string;
  description?: string;
  content?: string | null;
  priceInr?: number | null;
  priceUsd?: number | null;
  utmPriceInr?: number;
  utmPriceUsd?: number;
  image?: string | null;
  meetLink?: string | null;
  scheduledAt?: string | null;
  maxAttendees?: number;
  isActive?: boolean;
}
