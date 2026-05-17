import { type HealthResponse } from "@yoga-app/shared";

import { apiGet } from "../../lib/http";

export function fetchHealth() {
  return apiGet<HealthResponse>("/health");
}
