import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { roomsApi } from "../api";
import { queryKeys } from "../lib/react-query/query-keys";

export const roomQueryOptions = {
  publicPreview: () =>
    queryOptions({
      queryKey: queryKeys.rooms.publicPreview(),
      queryFn: roomsApi.publicPreview,
      staleTime: 60_000,   // public data, cache for 1 min
      gcTime: 5 * 60_000,
    }),
  upcomingGroup: () =>
    queryOptions({
      queryKey: queryKeys.rooms.upcoming(),
      queryFn: roomsApi.upcomingGroup,
      staleTime: 30_000,
    }),
  mySchedule: () =>
    queryOptions({
      queryKey: queryKeys.instructors.mySchedule(),
      queryFn: roomsApi.mySchedule,
      staleTime: 30_000,
    }),
};

export function usePublicRooms() {
  return useQuery(roomQueryOptions.publicPreview());
}

export function useUpcomingRooms() {
  return useQuery(roomQueryOptions.upcomingGroup());
}

export function useInstructorSchedule() {
  return useQuery(roomQueryOptions.mySchedule());
}

export function useEnrolRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.enrol(roomId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
      void qc.invalidateQueries({ queryKey: queryKeys.plans.mine() });
    },
  });
}

export function useJoinRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.join(roomId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useLeaveRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.leave(roomId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useBookPrivate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roomsApi.bookPrivate,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useRequestPrivate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roomsApi.requestPrivate,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.rooms.privateRequests() });
    },
  });
}

export function useMyPrivateRequests() {
  return useQuery({
    queryKey: queryKeys.rooms.privateRequests(),
    queryFn: roomsApi.myPrivateRequests,
    staleTime: 30_000,
  });
}
