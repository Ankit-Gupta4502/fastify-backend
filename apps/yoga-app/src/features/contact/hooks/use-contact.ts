import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateContactQueryBody } from "@yoga-app/shared";
import { contactApi } from "@/api/contact";
import { queryKeys } from "@/lib/react-query/query-keys";

export const contactQueryOptions = {
  adminList: () =>
    queryOptions({
      queryKey: queryKeys.contact.adminList(),
      queryFn: contactApi.adminList,
      staleTime: 15_000,
    }),
};

export function useSubmitContactQuery() {
  return useMutation({
    mutationFn: (body: CreateContactQueryBody) => contactApi.submit(body),
  });
}

export function useAdminContactQueries() {
  return useQuery(contactQueryOptions.adminList());
}

export function useAdminResolveContactQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactApi.adminResolve(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.contact.adminList() });
    },
  });
}
