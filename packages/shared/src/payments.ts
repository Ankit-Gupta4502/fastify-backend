import { z } from "zod";

export const createOrderBodySchema = z.object({
  planId: z.uuid("Invalid plan id"),
});

export const createCustomOrderBodySchema = z.object({
  sessionCount: z.number().int().min(4, "Minimum 4 sessions"),
});
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type CreateCustomOrderBody = z.infer<typeof createCustomOrderBodySchema>;

export const verifyPaymentBodySchema = z.object({
  planId: z.uuid("Invalid plan id"),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type VerifyPaymentBody = z.infer<typeof verifyPaymentBodySchema>;

export interface CreateOrderResult {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
}

export interface VerifyPaymentResult {
  success: true;
  planId: string;
}
