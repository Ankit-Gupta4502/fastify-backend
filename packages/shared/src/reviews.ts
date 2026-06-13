import { z } from "zod";

export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export interface AdminReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const createReviewSchema = z.object({
  reviewerName: z.string().min(1, "Reviewer name is required"),
  rating: z.number().int().min(1, "Min 1 star").max(5, "Max 5 stars"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  videoUrl: z.string().optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>;
