import { z } from "zod";

export const joinBodySchema = z.object({
  utmSource: z.string().max(200).optional().nullable(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export const createBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  content: z.string().max(20000).optional().nullable(),
  priceInr: z.number().int().min(0).optional().nullable(),
  priceUsd: z.number().int().min(0).optional().nullable(),
  utmPriceInr: z.number().int().min(0).optional(),
  utmPriceUsd: z.number().int().min(0).optional(),
  image: z.string().url().optional().nullable(),
  meetLink: z.string().url().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  maxAttendees: z.number().int().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export const updateBodySchema = createBodySchema.partial();

export type JoinBody = z.infer<typeof joinBodySchema>;
export type CreateBody = z.infer<typeof createBodySchema>;
export type UpdateBody = z.infer<typeof updateBodySchema>;
