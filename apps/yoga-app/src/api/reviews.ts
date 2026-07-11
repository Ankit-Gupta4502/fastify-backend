import {
  API_ENDPOINTS,
  type PublicReview,
  type AdminReview,
  type CreateReviewBody,
  type UpdateReviewBody,
} from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const reviewsApi = {
  public: () => apiRequest<PublicReview[]>(API_ENDPOINTS.REVIEWS.PUBLIC),
};

export const adminReviewsApi = {
  list: () =>
    apiRequest<AdminReview[]>(API_ENDPOINTS.ADMIN.REVIEWS),

  create: (body: CreateReviewBody) =>
    apiRequest<AdminReview>(API_ENDPOINTS.ADMIN.REVIEWS, {
      method: "POST",
      data: body,
    }),

  update: (id: string, body: UpdateReviewBody) =>
    apiRequest<AdminReview>(API_ENDPOINTS.ADMIN.REVIEW(id), {
      method: "PATCH",
      data: body,
    }),

  delete: (id: string) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.REVIEW(id), {
      method: "DELETE",
    }),
};
