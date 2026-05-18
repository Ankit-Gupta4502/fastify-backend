import { queryOptions, useQuery } from "@tanstack/react-query";
import { instructorsApi } from "../api";
import { queryKeys } from "../lib/react-query/query-keys";

export const instructorQueryOptions = {
  list: (filters?: { status?: string; specialty?: string }) =>
    queryOptions({
      queryKey: queryKeys.instructors.list(filters),
      queryFn: () => instructorsApi.list(filters),
      staleTime: 60_000,
    }),
};

export function useInstructors(filters?: { status?: string; specialty?: string }) {
  return useQuery(instructorQueryOptions.list(filters));
}
