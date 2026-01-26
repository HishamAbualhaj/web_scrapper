// types/api.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>; 
}

export interface ApiRequest<TBody = unknown> {
  apiUrl: string;
  method: HttpMethod;
  body?: TBody;
  params?: Record<string, string | number | boolean>;
  headers?: HeadersInit;
  signal?: AbortSignal;
}
