import { API_ENDPOINTS, type PlanRecord, type PlansWithPricingResponse } from "@yoga-app/shared";
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

  // User-only — includes priceCents + server-detected country for the pricing page.
  // VITE_FORCE_COUNTRY overrides server-detected country in local/staging (e.g. VITE_FORCE_COUNTRY=IN).
  listWithPricing: () => {
    const forceCountry = import.meta.env.VITE_FORCE_COUNTRY as string | undefined;
    return apiRequest<PlansWithPricingResponse>(API_ENDPOINTS.PLANS.PRICING, {
      params: forceCountry ? { country: forceCountry } : undefined,
    });
  },

  // User-only — all of the user's active subscriptions + plan details.
  mine: () => apiRequest<MyPlanResponse[]>(API_ENDPOINTS.PLANS.MINE),
};
