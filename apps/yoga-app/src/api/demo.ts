import type {
  AdminDemoRequest,
  AssignInstructorBody,
  CreateDemoRequestBody,
  CreateDemoRequestResult,
  InstructorDemoSession,
  MyDemoRequest,
  ScheduleMeetingBody,
  UpdateDemoRequestBody,
  UpdateDemoStatusBody,
} from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const demoApi = {
  submitRequest: (body: CreateDemoRequestBody) =>
    apiRequest<CreateDemoRequestResult>(API_ENDPOINTS.DEMO.CREATE_REQUEST, {
      method: "POST",
      data: body,
    }),

  myRequests: () =>
    apiRequest<MyDemoRequest[]>(API_ENDPOINTS.DEMO.MY_REQUESTS),

  updateMyRequest: (id: string, body: UpdateDemoRequestBody) =>
    apiRequest<null>(API_ENDPOINTS.DEMO.UPDATE_MY_REQUEST(id), {
      method: "PATCH",
      data: body,
    }),

  adminListRequests: () =>
    apiRequest<AdminDemoRequest[]>(API_ENDPOINTS.DEMO.ADMIN_LIST),

  adminGetRequest: (id: string) =>
    apiRequest<AdminDemoRequest>(API_ENDPOINTS.DEMO.ADMIN_DETAIL(id)),

  adminUpdateStatus: (id: string, body: UpdateDemoStatusBody) =>
    apiRequest<null>(API_ENDPOINTS.DEMO.ADMIN_UPDATE_STATUS(id), {
      method: "PATCH",
      data: body,
    }),

  adminAssignInstructor: (id: string, body: AssignInstructorBody) =>
    apiRequest<null>(API_ENDPOINTS.DEMO.ADMIN_ASSIGN_INSTRUCTOR(id), {
      method: "POST",
      data: body,
    }),

  adminScheduleMeeting: (id: string, body: ScheduleMeetingBody) =>
    apiRequest<null>(API_ENDPOINTS.DEMO.ADMIN_SCHEDULE_MEETING(id), {
      method: "POST",
      data: body,
    }),

  adminComplete: (id: string) =>
    apiRequest<null>(`/admin/demo-requests/${id}/complete`, {
      method: "PATCH",
    }),

  instructorSessions: () =>
    apiRequest<InstructorDemoSession[]>(
      API_ENDPOINTS.DEMO.INSTRUCTOR_SESSIONS,
    ),

  instructorScheduleMeeting: (id: string, body: ScheduleMeetingBody) =>
    apiRequest<null>(`/instructor/demo-sessions/${id}/meeting`, {
      method: "POST",
      data: body,
    }),
};
