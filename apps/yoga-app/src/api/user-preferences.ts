import type { SaveUserPreferencesBody, UserPreferences } from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";
import type { UtmData } from "../lib/utm";

export const userPreferencesApi = {
  get: () =>
    apiRequest<UserPreferences | null>(API_ENDPOINTS.USER.PREFERENCES),

  save: (body: SaveUserPreferencesBody) =>
    apiRequest<null>(API_ENDPOINTS.USER.PREFERENCES, {
      method: "POST",
      data: body,
    }),

  saveAcquisition: (body: UtmData) =>
    apiRequest<null>(API_ENDPOINTS.USER.ACQUISITION, {
      method: "POST",
      data: body,
    }),
};
