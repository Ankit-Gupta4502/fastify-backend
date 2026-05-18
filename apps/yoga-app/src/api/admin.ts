import type {
  AdminUser,
  AdminInstructor,
  AdminRoom,
  CreateGroupRoomBody,
  CreateGroupRoomResult,
} from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const adminApi = {
  listUsers: () =>
    apiRequest<AdminUser[]>(API_ENDPOINTS.ADMIN.USERS),

  listInstructors: () =>
    apiRequest<AdminInstructor[]>(API_ENDPOINTS.ADMIN.INSTRUCTORS),

  approveInstructor: (id: string, approve: boolean) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.APPROVE_INSTRUCTOR(id), {
      method: "PATCH",
      data: { approve },
    }),

  listGroupRooms: () =>
    apiRequest<AdminRoom[]>(API_ENDPOINTS.ADMIN.GROUP_ROOMS),

  createGroupRoom: (body: CreateGroupRoomBody) =>
    apiRequest<CreateGroupRoomResult>(API_ENDPOINTS.ADMIN.GROUP_ROOMS, {
      method: "POST",
      data: body,
    }),
};
