import type {
  AdminPrivateSessionRequest,
  AdminUser,
  AdminInstructor,
  AdminRoom,
  AssignPrivateSessionBody,
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

  listPrivateRequests: (status: "pending" | "approved" | "rejected" = "pending") =>
    apiRequest<AdminPrivateSessionRequest[]>(API_ENDPOINTS.ADMIN.PRIVATE_REQUESTS(status)),

  assignPrivateRequest: (id: string, body: AssignPrivateSessionBody) =>
    apiRequest<{ roomId: string }>(API_ENDPOINTS.ADMIN.ASSIGN_PRIVATE_REQUEST(id), {
      method: "PATCH",
      data: body,
    }),

  rejectPrivateRequest: (id: string, adminNote?: string | null) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.REJECT_PRIVATE_REQUEST(id), {
      method: "PATCH",
      data: { adminNote: adminNote ?? null },
    }),
};
