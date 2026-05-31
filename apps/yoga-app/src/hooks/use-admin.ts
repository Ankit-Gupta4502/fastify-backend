import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/admin";
import { queryKeys } from "../lib/react-query/query-keys";

export const adminQueryOptions = {
  users: () =>
    queryOptions({
      queryKey: queryKeys.admin.users(),
      queryFn: adminApi.listUsers,
      staleTime: 30_000,
    }),
  instructors: () =>
    queryOptions({
      queryKey: queryKeys.admin.instructors(),
      queryFn: adminApi.listInstructors,
      staleTime: 60_000,
    }),
  groupRooms: () =>
    queryOptions({
      queryKey: queryKeys.admin.groupRooms(),
      queryFn: adminApi.listGroupRooms,
      staleTime: 30_000,
    }),
};

export function useAdminUsers() {
  return useQuery(adminQueryOptions.users());
}

export function useAdminInstructors() {
  return useQuery(adminQueryOptions.instructors());
}

export function useAdminGroupRooms() {
  return useQuery(adminQueryOptions.groupRooms());
}

export function useCreateInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createInstructor,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.instructors() });
    },
  });
}

export function useApproveInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      adminApi.approveInstructor(id, approve),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.instructors() });
    },
  });
}

export function useUpdateInstructorPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) =>
      adminApi.updateInstructorPriority(id, sortOrder),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.instructors() });
    },
  });
}

export function useCreateGroupRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createGroupRoom,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.groupRooms() });
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}
