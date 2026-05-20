import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instructorsApi } from "../api";
import { uploadsApi } from "../api/uploads";
import { queryKeys } from "../lib/react-query/query-keys";

export const instructorQueryOptions = {
  list: (filters?: { status?: string; specialty?: string }) =>
    queryOptions({
      queryKey: queryKeys.instructors.list(filters),
      queryFn: () => instructorsApi.list(filters),
      staleTime: 60_000,
    }),
  myProfile: () =>
    queryOptions({
      queryKey: queryKeys.instructors.myProfile(),
      queryFn: instructorsApi.getProfile,
      staleTime: 60_000,
    }),
};

export function useInstructors(filters?: { status?: string; specialty?: string }) {
  return useQuery(instructorQueryOptions.list(filters));
}

export function useInstructorProfile() {
  return useQuery(instructorQueryOptions.myProfile());
}

export function useUpdateInstructorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: instructorsApi.updateProfile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.instructors.myProfile() });
    },
  });
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => uploadsApi.uploadAttachment(file),
  });
}

export function useInstructorWallet() {
  return useQuery({
    queryKey: queryKeys.instructors.myWallet(),
    queryFn: instructorsApi.getWallet,
    staleTime: 30_000,
  });
}
