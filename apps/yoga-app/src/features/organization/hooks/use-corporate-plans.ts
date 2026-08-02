import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useCorporatePlans() {
  return useQuery({
    queryKey: queryKeys.organizations.corporatePlans(),
    queryFn: organizationsApi.getCorporatePlans,
    staleTime: 5 * 60_000,
  });
}
