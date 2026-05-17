import {
  type LoginBody,
  type RegisterBody,
  type UserRole,
  type HealthResponse,
} from "@yoga-app/shared";
import { ENDPOINTS } from "../constants/endpoints";
import { API_BASE_URL, apiRequest, apiGet } from "../lib/http";

export interface SessionPayload {
  session: { id: string; expiresAt: string };
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string | null;
  };
}

// Auth Fetchers
export const authApi = {
  login: (payload: LoginBody) =>
    apiRequest<SessionPayload>(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      data: payload,
    }),
    
  register: (payload: RegisterBody) =>
    apiRequest<SessionPayload>(ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      data: payload,
    }),
    
  fetchSession: () => 
    apiRequest<SessionPayload>(ENDPOINTS.AUTH.SESSION),

  logout: () =>
    apiRequest<{ success: boolean }>(ENDPOINTS.AUTH.LOGIN.replace("login", "logout"), {
      method: "POST",
    }),
    
  getGoogleUrl: (callbackURL: string) => {
    const url = new URL(ENDPOINTS.AUTH.GOOGLE, API_BASE_URL);
    url.searchParams.set("callbackURL", callbackURL);
    return url.toString();
  },
};

// User Fetchers
export const userApi = {
  fetchDetail: () => 
    apiRequest<SessionPayload["user"]>(ENDPOINTS.USER.DETAIL),
};

// System Fetchers
export const systemApi = {
  fetchHealth: () => 
    apiGet<HealthResponse>(ENDPOINTS.SYSTEM.HEALTH),
};
