import { z } from "zod";

export const organizationIdParamsSchema = z.object({
  id: z.uuid(),
});

export const inviteTokenParamsSchema = z.object({
  token: z.string().trim().min(1),
});

export const memberIdParamsSchema = z.object({
  id: z.uuid(),
  memberId: z.uuid(),
});

export const inviteMembersBodySchema = z.object({
  emails: z.array(z.email()).min(1).max(50),
});

export const createSeatPurchaseBodySchema = z.object({
  corporatePlanId: z.uuid("Invalid corporate plan id"),
  seats: z.number().int().min(1).max(10000),
  country: z.string().length(2).optional(),
});

export const verifySeatPurchaseBodySchema = z.object({
  razorpaySubscriptionId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type InviteMembersBody = z.infer<typeof inviteMembersBodySchema>;
export type OrganizationIdParams = z.infer<typeof organizationIdParamsSchema>;
export type InviteTokenParams = z.infer<typeof inviteTokenParamsSchema>;
export type MemberIdParams = z.infer<typeof memberIdParamsSchema>;
export type CreateSeatPurchaseBody = z.infer<typeof createSeatPurchaseBodySchema>;
export type VerifySeatPurchaseBody = z.infer<typeof verifySeatPurchaseBodySchema>;
