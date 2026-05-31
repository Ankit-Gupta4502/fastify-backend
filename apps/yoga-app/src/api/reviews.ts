import { API_ENDPOINTS, type PublicReview } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const reviewsApi = {
  public: () => apiRequest<PublicReview[]>(API_ENDPOINTS.REVIEWS.PUBLIC),
};
