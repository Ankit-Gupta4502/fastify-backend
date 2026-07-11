import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, adminReviewsApi } from "@/api/reviews";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { CreateReviewBody, UpdateReviewBody } from "@yoga-app/shared";

export const reviewQueryOptions = {
  public: () =>
    queryOptions({
      queryKey: queryKeys.reviews.public(),
      queryFn: reviewsApi.public,
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
    }),
  adminList: () =>
    queryOptions({
      queryKey: [...queryKeys.reviews.all, "admin"],
      queryFn: adminReviewsApi.list,
    }),
};

export function usePublicReviews() {
  return useQuery(reviewQueryOptions.public());
}

export function useAdminReviews() {
  return useQuery(reviewQueryOptions.adminList());
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewBody) => adminReviewsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReviewBody }) =>
      adminReviewsApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReviewsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
