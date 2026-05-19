import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { roomsApi } from "../api";
import { queryKeys } from "../lib/react-query/query-keys";

export const roomQueryOptions = {
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
