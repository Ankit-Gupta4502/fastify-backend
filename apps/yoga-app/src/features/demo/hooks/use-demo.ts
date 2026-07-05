import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ApproveWithScheduleBody,
  AssignInstructorBody,
  CreateDemoRequestBody,
  ScheduleMeetingBody,
  UpdateDemoRequestBody,
  UpdateDemoStatusBody,
} from "@yoga-app/shared";
import { demoApi } from "@/api/demo";
import { queryKeys } from "@/lib/react-query/query-keys";

export const demoQueryOptions = {
  myRequests: () =>
    queryOptions({
      queryKey: queryKeys.demo.myRequests(),
      queryFn: demoApi.myRequests,
      staleTime: 30_000,
    }),

  adminList: () =>
    queryOptions({
      queryKey: queryKeys.demo.adminList(),
      queryFn: demoApi.adminListRequests,
      staleTime: 15_000,
    }),

  adminDetail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.demo.adminDetail(id),
      queryFn: () => demoApi.adminGetRequest(id),
      staleTime: 15_000,
    }),

  instructorSessions: () =>
    queryOptions({
      queryKey: queryKeys.demo.instructorSessions(),
      queryFn: demoApi.instructorSessions,
      staleTime: 30_000,
    }),
};

// ── User hooks ────────────────────────────────────────────────────────────────

export function useMyDemoRequests() {
  return useQuery(demoQueryOptions.myRequests());
}

export function useSubmitDemoRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDemoRequestBody) => demoApi.submitRequest(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.myRequests() });
    },
  });
}

export function useUpdateMyDemoRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDemoRequestBody }) =>
      demoApi.updateMyRequest(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.myRequests() });
    },
  });
}

// ── Admin hooks ───────────────────────────────────────────────────────────────

export function useAdminDemoRequests() {
  return useQuery(demoQueryOptions.adminList());
}

export function useAdminDemoRequest(id: string) {
  return useQuery(demoQueryOptions.adminDetail(id));
}

export function useAdminApproveWithSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ApproveWithScheduleBody }) =>
      demoApi.adminApproveWithSchedule(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminList() });
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminDetail(id) });
    },
  });
}

export function useAdminUpdateDemoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDemoStatusBody }) =>
      demoApi.adminUpdateStatus(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminList() });
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminDetail(id) });
    },
  });
}

export function useAdminAssignInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignInstructorBody }) =>
      demoApi.adminAssignInstructor(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminList() });
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminDetail(id) });
    },
  });
}

export function useAdminScheduleDemoMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ScheduleMeetingBody }) =>
      demoApi.adminScheduleMeeting(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminList() });
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminDetail(id) });
    },
  });
}

export function useAdminCompleteDemoSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demoApi.adminComplete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.adminList() });
    },
  });
}

// ── Instructor hooks ──────────────────────────────────────────────────────────

export function useInstructorDemoSessions() {
  return useQuery(demoQueryOptions.instructorSessions());
}

export function useInstructorScheduleDemoMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ScheduleMeetingBody }) =>
      demoApi.instructorScheduleMeeting(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.demo.instructorSessions() });
    },
  });
}
