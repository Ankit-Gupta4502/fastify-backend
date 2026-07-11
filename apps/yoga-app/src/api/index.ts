import {
  type LoginBody,
  type RegisterBody,
  type UserRole,
  type HealthResponse,
  type ForgotPasswordBody,
  type ResetPasswordBody,
} from "@yoga-app/shared";
import { ENDPOINTS } from "../constants/endpoints";
import { apiRequest, apiGet } from "../lib/http";

export interface SessionPayload {
  session: { id: string; expiresAt: string };
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string | null;
    emailVerified: boolean;
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
    apiRequest<{ success: boolean }>(ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    }),
    
  getGoogleUrl: (callbackURL: string) =>
    apiRequest<{ url: string | null }>(ENDPOINTS.AUTH.GOOGLE, {
      params: { callbackURL },
    }),

  forgotPassword: (payload: ForgotPasswordBody) =>
    apiRequest<null>(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      data: payload,
    }),

  resetPassword: (payload: ResetPasswordBody) =>
    apiRequest<null>(ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: "POST",
      data: payload,
    }),

  resendVerificationEmail: (email: string) =>
    apiRequest<null>(ENDPOINTS.AUTH.RESEND_VERIFICATION_EMAIL, {
      method: "POST",
      data: { email },
    }),

  verifyEmail: (token: string) =>
    apiRequest<SessionPayload>(ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: "POST",
      data: { token },
    }),
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

export { roomsApi } from "./rooms";
export { contactApi } from "./contact";
export { adminApi } from "./admin";
export { uploadsApi } from "./uploads";
export { instructorsApi } from "./instructors";
export { plansApi, type MyPlanResponse } from "./plans";
export { paymentsApi } from "./payments";
