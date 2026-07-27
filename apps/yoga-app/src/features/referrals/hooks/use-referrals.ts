import { queryOptions, useQuery } from "@tanstack/react-query";
import { referralsApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export const referralQueryOptions = {
  mine: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.referrals.mine(),
      queryFn: referralsApi.me,
      staleTime: 60_000,
      enabled,
    }),
};

export function useMyReferrals(enabled = true) {
  return useQuery(referralQueryOptions.mine(enabled));
}
