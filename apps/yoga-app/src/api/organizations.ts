import { ENDPOINTS } from "../constants/endpoints";
import { apiRequest } from "../lib/http";

export interface OrganizationInvitePreview {
  id: string;
  status: "invited" | "joined" | "removed";
  invitedEmail: string;
  organizationId: string;
  organizationName: string;
}

export interface MyOrganizationSummary {
  organizationId: string;
  name: string;
  sizeBand: string;
  role: "admin" | "member";
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string | null;
  invitedEmail: string;
  role: "admin" | "member";
  status: "invited" | "joined" | "removed";
  inviteToken: string | null;
  invitedByUserId: string | null;
  sponsoredUserSubscriptionId: string | null;
  invitedAt: string;
  joinedAt: string | null;
}

export interface OrganizationClassAttendee {
  userId: string;
  name: string;
  email: string;
}

export interface OrganizationClass {
  id: string;
  name: string | null;
  instructorId: string;
  instructorName: string;
  scheduledStart: string;
  scheduledEnd: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  attendees: OrganizationClassAttendee[];
}

export interface OrganizationCoupon {
  code: string;
  type: "percent" | "flat";
  value: number;
}

export interface CorporatePlan {
  id: string;
  name: string;
  linkedPlanId: string;
  basePricePerSeatCents: number | null;
  basePricePerSeatInrPaise: number | null;
  billingInterval: string;
  createdAt: string;
}

export interface SeatPurchaseResult {
  subscriptionId: string;
  keyId: string;
  organizationSubscriptionId: string;
}

export const organizationsApi = {
  getMyOrganizations: () =>
    apiRequest<MyOrganizationSummary[]>(ENDPOINTS.ORGANIZATIONS.MY_ORGANIZATIONS),

  getInvitePreview: (token: string) =>
    apiRequest<OrganizationInvitePreview>(ENDPOINTS.ORGANIZATIONS.INVITE_PREVIEW(token)),

  acceptInvite: (token: string) =>
    apiRequest<{ organizationId: string }>(ENDPOINTS.ORGANIZATIONS.ACCEPT_INVITE(token), {
      method: "POST",
    }),

  getMembers: (organizationId: string) =>
    apiRequest<OrganizationMember[]>(ENDPOINTS.ORGANIZATIONS.MEMBERS(organizationId)),

  inviteMembers: (organizationId: string, emails: string[]) =>
    apiRequest<{ invited: string[]; skipped: string[] }>(
      ENDPOINTS.ORGANIZATIONS.INVITE_MEMBERS(organizationId),
      { method: "POST", data: { emails } },
    ),

  promoteMember: (organizationId: string, memberId: string) =>
    apiRequest<{ success: true }>(ENDPOINTS.ORGANIZATIONS.PROMOTE_MEMBER(organizationId, memberId), {
      method: "PATCH",
    }),

  removeMember: (organizationId: string, memberId: string) =>
    apiRequest<{ success: true }>(ENDPOINTS.ORGANIZATIONS.REMOVE_MEMBER(organizationId, memberId), {
      method: "DELETE",
    }),

  getClasses: (organizationId: string) =>
    apiRequest<OrganizationClass[]>(ENDPOINTS.ORGANIZATIONS.CLASSES(organizationId)),

  getCoupon: (organizationId: string) =>
    apiRequest<OrganizationCoupon>(ENDPOINTS.ORGANIZATIONS.COUPON(organizationId)),

  getCorporatePlans: () =>
    apiRequest<CorporatePlan[]>(ENDPOINTS.ORGANIZATIONS.CORPORATE_PLANS),

  createSeatPurchase: (
    organizationId: string,
    payload: { corporatePlanId: string; seats: number; country?: string },
  ) =>
    apiRequest<SeatPurchaseResult>(ENDPOINTS.ORGANIZATIONS.SEAT_PURCHASE(organizationId), {
      method: "POST",
      data: payload,
    }),

  verifySeatPurchase: (
    organizationId: string,
    payload: { razorpaySubscriptionId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) =>
    apiRequest<{ success: true; organizationSubscriptionId: string }>(
      ENDPOINTS.ORGANIZATIONS.SEAT_PURCHASE_VERIFY(organizationId),
      { method: "POST", data: payload },
    ),
};
