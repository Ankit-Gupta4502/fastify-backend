import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateContactQueryBody, CreateCorporateInquiryBody } from "@yoga-app/shared";
import { contactApi } from "@/api/contact";
import { queryKeys } from "@/lib/react-query/query-keys";

export const contactQueryOptions = {
  adminList: () =>
    queryOptions({
      queryKey: queryKeys.contact.adminList(),
      queryFn: contactApi.adminList,
      staleTime: 15_000,
    }),
  corporateAdminList: () =>
    queryOptions({
      queryKey: queryKeys.contact.corporateAdminList(),
      queryFn: contactApi.adminCorporateList,
      staleTime: 15_000,
    }),
};

export function useSubmitContactQuery() {
  return useMutation({
    mutationFn: (body: CreateContactQueryBody) => contactApi.submit(body),
  });
}

export function useSubmitCorporateInquiry() {
  return useMutation({
    mutationFn: (body: CreateCorporateInquiryBody) => contactApi.submitCorporateInquiry(body),
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

export function useAdminCorporateInquiries() {
  return useQuery(contactQueryOptions.corporateAdminList());
}

export function useAdminResolveCorporateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactApi.adminCorporateResolve(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.contact.corporateAdminList() });
    },
  });
}
