import { z } from "zod";

export const createOrderBodySchema = z.object({
  planId: z.uuid("Invalid plan id"),
});
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;

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
