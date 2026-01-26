import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { apiFetcher } from "@/lib/api/apiFetcher";
import { ApiError, ApiRequest } from "@/types/api";

export function useApiMutation<TResponse, TBody = unknown>(
  options?: UseMutationOptions<TResponse, ApiError, ApiRequest<TBody>>,
) {
  return useMutation<TResponse, ApiError, ApiRequest<TBody>>({
    mutationFn: (request) => apiFetcher<TResponse, TBody>(request),
    ...options,
  });
}
