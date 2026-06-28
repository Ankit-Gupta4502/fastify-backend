import {
  API_ENDPOINTS,
  type BookPrivateResult,
  type EnrolRoomResult,
  type InstructorScheduleRoom,
  type JoinRoomResult,
  type LeaveRoomResult,
  type MyPrivateSessionRequest,
  type PublicRoomPreview,
  type RequestPrivateSessionResult,
  type UpcomingRoom,
} from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const roomsApi = {
  publicPreview: () =>
    apiRequest<PublicRoomPreview[]>(API_ENDPOINTS.ROOMS.PUBLIC_PREVIEW),

  upcomingGroup: () =>
    apiRequest<UpcomingRoom[]>(API_ENDPOINTS.ROOMS.UPCOMING_GROUP),

  enrol: (roomId: string) =>
    apiRequest<EnrolRoomResult>(API_ENDPOINTS.ROOMS.ENROL(roomId), {
      method: "POST",
    }),

  join: (roomId: string) =>
    apiRequest<JoinRoomResult>(API_ENDPOINTS.ROOMS.JOIN(roomId), {
      method: "POST",
    }),

  leave: (roomId: string) =>
    apiRequest<LeaveRoomResult>(API_ENDPOINTS.ROOMS.LEAVE(roomId), {
      method: "POST",
    }),

  bookPrivate: (payload: {
    instructorId: string;
    startUtc: string;
    endUtc: string;
  }) =>
    apiRequest<BookPrivateResult>(API_ENDPOINTS.ROOMS.BOOK_PRIVATE, {
      method: "POST",
      data: payload,
    }),

  requestPrivate: (payload: { slots: Array<{ startUtc: string; endUtc: string }> }) =>
    apiRequest<RequestPrivateSessionResult>(API_ENDPOINTS.ROOMS.REQUEST_PRIVATE, {
      method: "POST",
      data: payload,
    }),

  myPrivateRequests: () =>
    apiRequest<MyPrivateSessionRequest[]>(API_ENDPOINTS.ROOMS.MY_PRIVATE_REQUESTS),

  mySchedule: () =>
    apiRequest<InstructorScheduleRoom[]>(API_ENDPOINTS.INSTRUCTORS.MY_SCHEDULE),
};
