import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SaveUserPreferencesBody } from "@yoga-app/shared";
import { userPreferencesApi } from "../api/user-preferences";
import { queryKeys } from "../lib/react-query/query-keys";

export const userPreferencesQueryOptions = queryOptions({
  queryKey: queryKeys.userPreferences.mine(),
  queryFn: userPreferencesApi.get,
  staleTime: 60_000,
});

export function useMyPreferences() {
  return useQuery(userPreferencesQueryOptions);
}

export function useSavePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveUserPreferencesBody) => userPreferencesApi.save(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.userPreferences.mine() });
    },
  });
}
