import type {
  AdminContactQuery,
  AdminCorporateInquiry,
  CreateContactQueryBody,
  CreateCorporateInquiryBody,
  CreateContactQueryResult,
} from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const contactApi = {
  submit: (body: CreateContactQueryBody) =>
    apiRequest<CreateContactQueryResult>(API_ENDPOINTS.CONTACT.SUBMIT, {
      method: "POST",
      data: body,
    }),

  adminList: () =>
    apiRequest<AdminContactQuery[]>(API_ENDPOINTS.CONTACT.ADMIN_LIST),

  adminResolve: (id: string) =>
    apiRequest<null>(API_ENDPOINTS.CONTACT.ADMIN_RESOLVE(id), {
      method: "PATCH",
    }),

  submitCorporateInquiry: (body: CreateCorporateInquiryBody) =>
    apiRequest<CreateContactQueryResult>(API_ENDPOINTS.CONTACT.CORPORATE_SUBMIT, {
      method: "POST",
      data: body,
    }),

  adminCorporateList: () =>
    apiRequest<AdminCorporateInquiry[]>(API_ENDPOINTS.CONTACT.CORPORATE_ADMIN_LIST),

  adminCorporateResolve: (id: string) =>
    apiRequest<null>(API_ENDPOINTS.CONTACT.CORPORATE_ADMIN_RESOLVE(id), {
      method: "PATCH",
    }),
};
