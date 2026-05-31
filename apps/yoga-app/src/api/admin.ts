import type {
  AdminUser,
  AdminInstructor,
  AdminRoom,
  CreateGroupRoomBody,
  CreateGroupRoomResult,
  CreateInstructorBody,
} from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const adminApi = {
  listUsers: () =>
    apiRequest<AdminUser[]>(API_ENDPOINTS.ADMIN.USERS),

  listInstructors: () =>
    apiRequest<AdminInstructor[]>(API_ENDPOINTS.ADMIN.INSTRUCTORS),

  createInstructor: (body: CreateInstructorBody) =>
    apiRequest<{ id: string; name: string; email: string }>(API_ENDPOINTS.ADMIN.INSTRUCTORS, {
      method: "POST",
      data: body,
    }),

  approveInstructor: (id: string, approve: boolean) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.APPROVE_INSTRUCTOR(id), {
      method: "PATCH",
      data: { approve },
    }),

  updateInstructorPriority: (id: string, sortOrder: number) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.UPDATE_INSTRUCTOR_PRIORITY(id), {
      method: "PATCH",
      data: { sortOrder },
    }),

  listGroupRooms: () =>
    apiRequest<AdminRoom[]>(API_ENDPOINTS.ADMIN.GROUP_ROOMS),

  createGroupRoom: (body: CreateGroupRoomBody) =>
    apiRequest<CreateGroupRoomResult>(API_ENDPOINTS.ADMIN.GROUP_ROOMS, {
      method: "POST",
      data: body,
    }),
};
