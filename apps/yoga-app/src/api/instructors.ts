import {
  API_ENDPOINTS,
  type InstructorListItem,
  type InstructorProfile,
  type PublicInstructorProfile,
  type UpdateAvailabilityBody,
  type UpdateProfileBody,
  type WalletBalance,
} from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const instructorsApi = {
  list: (filters?: { status?: string; specialty?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.specialty) params.set("specialty", filters.specialty);
    const qs = params.toString();
    const path = qs
      ? `${API_ENDPOINTS.INSTRUCTORS.LIST}?${qs}`
      : API_ENDPOINTS.INSTRUCTORS.LIST;
    return apiRequest<InstructorListItem[]>(path);
  },

  getExpertProfile: (id: string) =>
    apiRequest<PublicInstructorProfile>(API_ENDPOINTS.INSTRUCTORS.EXPERT_PROFILE(id)),

  getProfile: () =>
    apiRequest<InstructorProfile>(API_ENDPOINTS.INSTRUCTORS.MY_PROFILE),

  updateProfile: (body: UpdateProfileBody) =>
    apiRequest<null>(API_ENDPOINTS.INSTRUCTORS.MY_PROFILE, {
      method: "PUT",
      data: body,
    }),

  updateAvailability: (body: UpdateAvailabilityBody) =>
    apiRequest<null>(API_ENDPOINTS.INSTRUCTORS.MY_AVAILABILITY, {
      method: "PUT",
      data: body,
    }),

  getWallet: () =>
    apiRequest<WalletBalance>(API_ENDPOINTS.INSTRUCTORS.MY_WALLET),
};
