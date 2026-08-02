import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useMyOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations.mine(),
    queryFn: organizationsApi.getMyOrganizations,
    staleTime: 5 * 60_000,
  });
}
