import { queryOptions } from "@tanstack/react-query";

import { queryKeys } from "../../lib/react-query/query-keys";
import { fetchHealth } from "./system.api";

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.system.health(),
    queryFn: fetchHealth,
    staleTime: 30_000,
  });
