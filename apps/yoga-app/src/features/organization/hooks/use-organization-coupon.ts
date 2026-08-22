import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useOrganizationCoupon(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.coupon(organizationId),
    queryFn: () => organizationsApi.getCoupon(organizationId),
    staleTime: 5 * 60_000,
  });
}
