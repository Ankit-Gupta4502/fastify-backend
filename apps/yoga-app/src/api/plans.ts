import { API_ENDPOINTS, type PlanRecord } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

// Public plan shape — no priceCents
export type PlanFeatures = Omit<PlanRecord, "priceCents">;

export interface MyPlanResponse {
  subscriptionId: string;
  sessionsTotal: number | null;
  sessionsUsed: number;
  pricePaidCents: number;
  purchasedAt: string;
  expiresAt: string | null;
  plan: PlanRecord;
  sessionsUsedThisWeek: number;
  weekResetAt: string;
}

export const plansApi = {
  // Public — feature flags only, no pricing. Safe for any role.
  list: () => apiRequest<PlanFeatures[]>(API_ENDPOINTS.PLANS.LIST),

  // User-only — includes priceCents for the billing page.
  listWithPricing: () => apiRequest<PlanRecord[]>(API_ENDPOINTS.PLANS.PRICING),

  // User-only — current active subscription + plan details.
  mine: () => apiRequest<MyPlanResponse | null>(API_ENDPOINTS.PLANS.MINE),
};
