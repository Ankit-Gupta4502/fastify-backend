import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminInstructorSessionsFilters,
  UpdateGroupRoomBody,
  UpdateInstructorStatsBody,
} from "@yoga-app/shared";
import type { AdminUsersFilters } from "@/api/admin";
import { adminApi } from "@/api/admin";
import { queryKeys } from "@/lib/react-query/query-keys";

export const adminQueryOptions = {
  users: (filters?: AdminUsersFilters) =>
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

export function useAdminUsers(filters?: AdminUsersFilters) {
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

export function useAdminInstructorDetail(id: string, filters?: AdminInstructorSessionsFilters) {
  return useQuery({
    queryKey: queryKeys.admin.instructorDetail(id, filters),
    queryFn: () => adminApi.getInstructorDetail(id, filters),
    staleTime: 30_000,
    // Sessions pagination/date filters change the query key, but the profile
    // and wallet sections shouldn't flash back to a loading state for that —
    // keep the previous page's data on screen while the next page loads.
    placeholderData: keepPreviousData,
  });
}

export function useAdminInstructorSessionDetail(instructorId: string, roomId: string) {
  return useQuery({
    queryKey: queryKeys.admin.instructorSessionDetail(instructorId, roomId),
    queryFn: () => adminApi.getInstructorSessionDetail(instructorId, roomId),
    staleTime: 30_000,
  });
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

export function useUpdateInstructorStats() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateInstructorStatsBody }) =>
      adminApi.updateInstructorStats(id, body),
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

export function useCancelGroupRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.cancelGroupRoom(id),
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
