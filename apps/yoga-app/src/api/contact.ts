import type {
  AdminContactQuery,
  CreateContactQueryBody,
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
};
