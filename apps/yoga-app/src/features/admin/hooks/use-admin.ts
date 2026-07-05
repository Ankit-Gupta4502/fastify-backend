import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateGroupRoomBody } from "@yoga-app/shared";
import { adminApi } from "@/api/admin";
import { queryKeys } from "@/lib/react-query/query-keys";

export const adminQueryOptions = {
  users: (filters?: { search?: string; role?: string; plan?: string }) =>
    queryOptions({
      queryKey: queryKeys.admin.users(filters),
      queryFn: () => adminApi.listUsers(filters),
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

export function useAdminUsers(filters?: { search?: string; role?: string; plan?: string }) {
  return useQuery(adminQueryOptions.users(filters));
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(id),
    queryFn: () => adminApi.getUserDetail(id),
    staleTime: 30_000,
  });
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

export function useUpdateGroupRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGroupRoomBody }) =>
      adminApi.updateGroupRoom(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.groupRooms() });
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useDeleteGroupRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteGroupRoom(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.groupRooms() });
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useAdminPrivateRequests(status: "pending" | "approved" | "rejected" = "pending") {
  return useQuery({
    queryKey: [...queryKeys.admin.privateRequests(), status],
    queryFn: () => adminApi.listPrivateRequests(status),
    staleTime: 30_000,
  });
}

export function useAssignPrivateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, instructorId, adminNote }: { id: string; instructorId: string; adminNote?: string | null }) =>
      adminApi.assignPrivateRequest(id, { instructorId, adminNote }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.privateRequests() });
    },
  });
}

export function useRejectPrivateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string | null }) =>
      adminApi.rejectPrivateRequest(id, adminNote),
    onSuccess: () => {
      // Invalidate all status tabs so counts stay fresh after a status change
      void qc.invalidateQueries({ queryKey: queryKeys.admin.privateRequests() });
    },
  });
}
