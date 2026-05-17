import axios, { AxiosError } from "axios";
import { DEFAULT_BACKEND_URL, type ApiResponse } from "@yoga-app/shared";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_BACKEND_URL;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: ApiResponse<unknown>,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiResponse<unknown> | undefined;

    return new ApiRequestError(
      payload?.message || error.message || "Request failed",
      error.response?.status ?? 500,
      payload,
    );
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message, 500);
  }

  return new ApiRequestError("Unknown request failure", 500);
}

export async function apiRequest<T>(
  path: string,
  config?: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    data?: unknown;
    params?: Record<string, unknown>;
    signal?: AbortSignal;
  },
): Promise<ApiResponse<T>> {
  try {
    const response = await http.request<ApiResponse<T>>({
      url: path,
      method: config?.method ?? "GET",
      data: config?.data,
      params: config?.params,
      signal: config?.signal,
    });

    if (!response.data.success) {
      throw new ApiRequestError(
        response.data.message || "Request failed",
        response.status,
        response.data,
      );
    }

    return response.data;
  } catch (error) {
    throw toApiRequestError(error);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const response = await http.get<T>(path);
    return response.data;
  } catch (error) {
    throw toApiRequestError(error);
  }
}
