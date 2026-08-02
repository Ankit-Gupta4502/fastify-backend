import { z } from "zod";

export const PRICE_PER_SESSION_CENTS = 2000;
export const PRICE_DISCOUNT_CENTS = 100;
export const MIN_SESSIONS = 4;
export const MAX_SESSIONS = 50;

export function calcCustomPriceCents(sessionCount: number): number {
  return sessionCount * PRICE_PER_SESSION_CENTS - PRICE_DISCOUNT_CENTS;
}

// INR pricing for custom session plans
export const PRICE_PER_SESSION_INR_PAISE = 170000; // ₹1700 per session
export const PRICE_DISCOUNT_INR_PAISE = 10000;     // ₹100 discount

export function calcCustomPriceInrPaise(sessionCount: number): number {
  return sessionCount * PRICE_PER_SESSION_INR_PAISE - PRICE_DISCOUNT_INR_PAISE;
}

export const createOrderBodySchema = z.object({
  planId: z.uuid("Invalid plan id"),
  country: z.string().length(2).optional(), // ISO 3166-1 alpha-2, e.g. "IN"
  // When present, replaces the flat PRICE_DISCOUNT with the coupon's own
  // discount (e.g. an organization's corporate self-pay coupon).
  couponCode: z.string().trim().min(1).optional(),
});

export const createCustomOrderBodySchema = z.object({
  sessionCount: z.number().int().min(4, "Minimum 4 sessions").max(50, "Maximum 50 sessions"),
  planName: z.enum(["private", "prenatal_postnatal", "therapeutic_yoga"]),
  country: z.string().length(2).optional(),
  couponCode: z.string().trim().min(1).optional(),
});
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type CreateCustomOrderBody = z.infer<typeof createCustomOrderBodySchema>;

export const verifyPaymentBodySchema = z.object({
  razorpaySubscriptionId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type VerifyPaymentBody = z.infer<typeof verifyPaymentBodySchema>;

export const cancelSubscriptionBodySchema = z.object({
  subscriptionId: z.uuid("Invalid subscription id"),
});
export type CancelSubscriptionBody = z.infer<typeof cancelSubscriptionBodySchema>;

export interface CreateOrderResult {
  subscriptionId: string;
  keyId: string;
  planId: string;
  planName: string;
}

export interface VerifyPaymentResult {
  success: true;
  subscriptionId: string;
}
