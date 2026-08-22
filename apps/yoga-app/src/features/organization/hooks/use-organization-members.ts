import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "@/api";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members(organizationId),
    queryFn: () => organizationsApi.getMembers(organizationId),
    staleTime: 30_000,
  });
}

export function useInviteMembers(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (emails: string[]) => organizationsApi.inviteMembers(organizationId, emails),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.organizations.members(organizationId) });
    },
  });
}

export function usePromoteMember(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => organizationsApi.promoteMember(organizationId, memberId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.organizations.members(organizationId) });
    },
  });
}

export function useRemoveMember(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => organizationsApi.removeMember(organizationId, memberId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.organizations.members(organizationId) });
    },
  });
}
