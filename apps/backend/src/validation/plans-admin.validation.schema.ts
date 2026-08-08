import { z } from "zod";

export const planIdParamsSchema = z.object({
  id: z.uuid("Invalid plan id"),
});

export const createPlanBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.string().trim().min(1).max(40).default("standard"),
  billingInterval: z.enum(["week", "month"]).default("month"),
  sessionsPerWeek: z.number().int().min(0).optional().nullable(),
  sessionsPerMonth: z.number().int().min(0).optional().nullable(),
  allowsPrivate: z.boolean().default(false),
  allowsTimeFlexibility: z.boolean().default(false),
  maxRoomCapacity: z.number().int().min(1).optional().nullable(),
  priceCents: z.number().int().min(0).optional().nullable(),
  priceInrPaise: z.number().int().min(0).optional().nullable(),
  pricePerSessionCents: z.number().int().min(0).optional().nullable(),
  pricePerSessionInrPaise: z.number().int().min(0).optional().nullable(),
});

export const updatePlanBodySchema = createPlanBodySchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "At least one field must be provided" },
);

export const corporatePlanIdParamsSchema = z.object({
  id: z.uuid("Invalid corporate plan id"),
});

export const createCorporatePlanBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
  linkedPlanId: z.uuid("Invalid linked plan id"),
  billingInterval: z.enum(["week", "month"]).default("month"),
});

export const updateCorporatePlanBodySchema = createCorporatePlanBodySchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "At least one field must be provided" },
);

export type PlanIdParams = z.infer<typeof planIdParamsSchema>;
export type CreatePlanBody = z.infer<typeof createPlanBodySchema>;
export type UpdatePlanBody = z.infer<typeof updatePlanBodySchema>;
export type CorporatePlanIdParams = z.infer<typeof corporatePlanIdParamsSchema>;
export type CreateCorporatePlanBody = z.infer<typeof createCorporatePlanBodySchema>;
export type UpdateCorporatePlanBody = z.infer<typeof updateCorporatePlanBodySchema>;
