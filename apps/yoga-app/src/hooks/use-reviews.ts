import { queryOptions, useQuery } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviews";
import { queryKeys } from "../lib/react-query/query-keys";

export const reviewQueryOptions = {
  public: () =>
    queryOptions({
      queryKey: queryKeys.reviews.public(),
      queryFn: reviewsApi.public,
      staleTime: 5 * 60_000,  // reviews change infrequently
      gcTime: 10 * 60_000,
    }),
};

export function usePublicReviews() {
  return useQuery(reviewQueryOptions.public());
}
