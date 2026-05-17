export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string | null;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}
