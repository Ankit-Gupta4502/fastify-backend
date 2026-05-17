import {
  type LoginBody,
  type RegisterBody,
  type UserRole,
} from "@yoga-app/shared";

import { API_BASE_URL, apiRequest } from "../../lib/http";

export interface SessionPayload {
  session: {
    id: string;
    expiresAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string | null;
  };
}

export function registerUser(payload: RegisterBody) {
  return apiRequest<SessionPayload>("/auth/register", {
    method: "POST",
    data: payload,
  });
}

export function loginUser(payload: LoginBody) {
  return apiRequest<SessionPayload>("/auth/login", {
    method: "POST",
    data: payload,
  });
}

export function fetchSession() {
  return apiRequest<SessionPayload>("/auth/session");
}

export function getGoogleSignInUrl(callbackURL: string) {
  const url = new URL("/auth/google", API_BASE_URL);
  url.searchParams.set("callbackURL", callbackURL);
  return url.toString();
}
