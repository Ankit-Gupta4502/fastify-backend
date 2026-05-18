import type {
  Workshop,
  AdminWorkshop,
  WorkshopJoinBody,
  CreateWorkshopBody,
  UpdateWorkshopBody,
} from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const workshopsApi = {
  list: () =>
    apiRequest<Workshop[]>(API_ENDPOINTS.WORKSHOPS.LIST),

  detail: (id: string) =>
    apiRequest<Workshop>(API_ENDPOINTS.WORKSHOPS.DETAIL(id)),

  join: (id: string, body: WorkshopJoinBody) =>
    apiRequest<null>(API_ENDPOINTS.WORKSHOPS.JOIN(id), { method: "POST", data: body }),

  adminList: () =>
    apiRequest<AdminWorkshop[]>(API_ENDPOINTS.WORKSHOPS.ADMIN_LIST),

  adminCreate: (body: CreateWorkshopBody) =>
    apiRequest<{ id: string }>(API_ENDPOINTS.WORKSHOPS.ADMIN_CREATE, { method: "POST", data: body }),

  adminUpdate: (id: string, body: UpdateWorkshopBody) =>
    apiRequest<null>(API_ENDPOINTS.WORKSHOPS.ADMIN_UPDATE(id), { method: "PATCH", data: body }),

  adminDelete: (id: string) =>
    apiRequest<null>(API_ENDPOINTS.WORKSHOPS.ADMIN_DELETE(id), { method: "DELETE" }),
};
