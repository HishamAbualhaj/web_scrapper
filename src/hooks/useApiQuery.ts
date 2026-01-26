// hooks/useApiQuery.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { ApiRequest } from "@/types/api";
import { apiFetcher } from "@/lib/api/apiFetcher";

export function useApiQuery<TResponse>(
  queryKey: unknown[],
  request: ApiRequest,
  options?: Omit<UseQueryOptions<TResponse>, "queryKey" | "queryFn">
) {
  return useQuery<TResponse>({
    queryKey,
    queryFn: () => apiFetcher<TResponse>(request),
    ...options,
  });
}
