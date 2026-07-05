export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string | null;
  /** Present on 422 validation errors — field name -> that field's error message. */
  details?: Record<string, string>;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}
