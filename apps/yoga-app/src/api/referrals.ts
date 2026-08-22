import { ENDPOINTS } from "../constants/endpoints";
import { apiRequest } from "../lib/http";

export type ReferredUserStatus = "signed_up" | "pending" | "rewarded";

export interface ReferredUserSummary {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: ReferredUserStatus;
}

export interface ReferralDashboardResponse {
  referralCode: string;
  referralLink: string;
  referredCount: number;
  rewardedCount: number;
  referredUsers: ReferredUserSummary[];
}

export const referralsApi = {
  me: () => apiRequest<ReferralDashboardResponse>(ENDPOINTS.REFERRALS.ME),
};
