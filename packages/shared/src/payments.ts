import { z } from "zod";

export const PRICE_PER_SESSION_CENTS = 2000;
export const PRICE_DISCOUNT_CENTS = 100;
export const MIN_SESSIONS = 4;
export const MAX_SESSIONS = 50;

export function calcCustomPriceCents(sessionCount: number): number {
  return sessionCount * PRICE_PER_SESSION_CENTS - PRICE_DISCOUNT_CENTS;
}

export const createOrderBodySchema = z.object({
  planId: z.uuid("Invalid plan id"),
});

export const createCustomOrderBodySchema = z.object({
  sessionCount: z.number().int().min(4, "Minimum 4 sessions").max(50, "Maximum 50 sessions"),
  planName: z.enum(["private", "prenatal_postnatal", "therapeutic_yoga"]),
});
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type CreateCustomOrderBody = z.infer<typeof createCustomOrderBodySchema>;

export const verifyPaymentBodySchema = z.object({
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
  subscriptionId: string;
}
