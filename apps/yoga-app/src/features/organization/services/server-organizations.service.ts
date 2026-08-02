import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { API_BASE_URL } from "@/lib/http";
import { ENDPOINTS } from "@/constants/endpoints";
import type { MyOrganizationSummary } from "@/api";

// Mirrors fetchUserFn (features/auth/services/server-auth.service.ts) — the
// generic axios client can't forward the incoming request's cookies during
// SSR, so route beforeLoad gates need this explicit server-function version
// instead of calling organizationsApi.getMyOrganizations() directly.
export const fetchMyOrganizationsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<MyOrganizationSummary[]> => {
    const cookieHeader = getRequestHeader("cookie") ?? "";
    try {
      const res = await fetch(`${API_BASE_URL}${ENDPOINTS.ORGANIZATIONS.MY_ORGANIZATIONS}`, {
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success && json.data ? json.data : [];
    } catch {
      return [];
    }
  },
);
