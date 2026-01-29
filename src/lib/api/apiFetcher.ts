// lib/apiFetcher.ts
import { ApiError, ApiRequest } from "@/types/api";

export async function apiFetcher<TResponse, TBody = unknown>(
  request: ApiRequest<TBody>,
): Promise<TResponse> {
  const { apiUrl, method, body, headers, signal } = request;

  const res = await fetch(apiUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    const error: ApiError = {
      message: data?.message || "Request failed",
      status: res.status,
      errors: data?.error,
    };
    throw error;
  }

  if (!res.ok) {
    const error: ApiError = {
      message: data?.message || "Request failed",
      status: res.status,
      errors: data?.error,
    };
    throw error;
  }

  return data as TResponse;
}
