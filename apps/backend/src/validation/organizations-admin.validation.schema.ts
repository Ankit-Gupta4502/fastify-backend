import { z } from "zod";

export const adminOrganizationIdParamsSchema = z.object({
  id: z.uuid("Invalid organization id"),
});

export const setBillingApprovalBodySchema = z.object({
  approved: z.boolean(),
});

export const setOrganizationPricingBodySchema = z.object({
  pricePerSeatCents: z.number().int().min(0).optional().nullable(),
  pricePerSeatInrPaise: z.number().int().min(0).optional().nullable(),
});

export const setOrganizationCouponBodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("percent"), value: z.number().int().min(0).max(100) }),
  z.object({ type: z.literal("flat"), value: z.number().int().min(0) }),
]);

export type AdminOrganizationIdParams = z.infer<typeof adminOrganizationIdParamsSchema>;
export type SetBillingApprovalBody = z.infer<typeof setBillingApprovalBodySchema>;
export type SetOrganizationPricingBody = z.infer<typeof setOrganizationPricingBodySchema>;
export type SetOrganizationCouponBody = z.infer<typeof setOrganizationCouponBodySchema>;
