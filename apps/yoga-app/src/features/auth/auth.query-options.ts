import { queryOptions } from "@tanstack/react-query";

import { queryKeys } from "../../lib/react-query/query-keys";
import { fetchSession } from "./auth.api";

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.auth.session(),
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false,
  });
