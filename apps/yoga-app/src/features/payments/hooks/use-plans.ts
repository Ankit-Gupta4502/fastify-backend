import { queryOptions, useQuery } from "@tanstack/react-query";
import { plansApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export const planQueryOptions = {
  // Public list — no pricing. Safe for any role.
  list: () =>
    queryOptions({
      queryKey: queryKeys.plans.list(),
      queryFn: plansApi.list,
      staleTime: 5 * 60_000,
    }),
  // User-only — includes priceCents. Used only by the billing page.
  listWithPricing: () =>
    queryOptions({
      queryKey: [...queryKeys.plans.list(), "pricing"] as const,
      queryFn: plansApi.listWithPricing,
      staleTime: 5 * 60_000,
    }),
  mine: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.plans.mine(),
      queryFn: plansApi.mine,
      staleTime: 60_000,
      enabled,
    }),
};

export function usePlans() {
  return useQuery(planQueryOptions.list());
}

export function usePlansWithPricing() {
  return useQuery(planQueryOptions.listWithPricing());
}

export function useMyPlan(enabled = true) {
  return useQuery(planQueryOptions.mine(enabled));
}
