import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workshopsApi } from "../api/workshops";
import { queryKeys } from "../lib/react-query/query-keys";
import type { WorkshopJoinBody, CreateWorkshopBody, UpdateWorkshopBody } from "@yoga-app/shared";

export function useWorkshops() {
  return useQuery({
    queryKey: queryKeys.workshops.list(),
    queryFn: workshopsApi.list,
    staleTime: 60_000,
  });
}

export function useWorkshop(id: string) {
  return useQuery({
    queryKey: queryKeys.workshops.detail(id),
    queryFn: () => workshopsApi.detail(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useJoinWorkshop() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: WorkshopJoinBody }) =>
      workshopsApi.join(id, body),
  });
}

export function useAdminWorkshops() {
  return useQuery({
    queryKey: queryKeys.admin.workshops(),
    queryFn: workshopsApi.adminList,
    staleTime: 30_000,
  });
}

export function useCreateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkshopBody) => workshopsApi.adminCreate(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.workshops() }),
  });
}

export function useUpdateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateWorkshopBody }) =>
      workshopsApi.adminUpdate(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.workshops() }),
  });
}

export function useDeleteWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workshopsApi.adminDelete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.workshops() }),
  });
}
