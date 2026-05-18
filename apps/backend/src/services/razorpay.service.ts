import { createHmac } from "node:crypto";
import Razorpay from "razorpay";

let cached: Razorpay | null = null;

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

export function getRazorpay(): Razorpay {
  if (cached) return cached;
  cached = new Razorpay({
    key_id: requireEnv("RAZORPAY_KEY_ID"),
    key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
  });
  return cached;
}

export function getRazorpayKeyId(): string {
  return requireEnv("RAZORPAY_KEY_ID");
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = createHmac("sha256", requireEnv("RAZORPAY_KEY_SECRET"))
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

/**
 * Verifies a Razorpay webhook event signature.
 * Uses RAZORPAY_WEBHOOK_SECRET (set in Razorpay dashboard → Webhooks),
 * NOT the key secret.
 */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const expected = createHmac("sha256", requireEnv("RAZORPAY_WEBHOOK_SECRET"))
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
