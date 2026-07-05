import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { API_BASE_URL } from "@/lib/http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { AuthUser } from "../store/auth.store";

export const fetchUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser | null> => {
    const cookieHeader = getRequestHeader("cookie") ?? "";
    try {
      const res = await fetch(`${API_BASE_URL}${ENDPOINTS.USER.DETAIL}`, {
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  },
);
