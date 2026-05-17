import { useQuery, queryOptions } from "@tanstack/react-query";
import { systemApi } from "../api";

export const systemQueryOptions = {
  health: () => queryOptions({
    queryKey: ["system", "health"],
    queryFn: systemApi.fetchHealth,
    staleTime: 30_000,
  }),
};

export function useSystem() {
  const healthQuery = useQuery(systemQueryOptions.health());
  
  return {
    health: healthQuery.data,
    isLoading: healthQuery.isLoading,
    isError: healthQuery.isError,
  };
}
