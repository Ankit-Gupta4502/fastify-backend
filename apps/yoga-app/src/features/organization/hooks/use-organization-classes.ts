import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useOrganizationClasses(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.classes(organizationId),
    queryFn: () => organizationsApi.getClasses(organizationId),
    staleTime: 30_000,
  });
}
