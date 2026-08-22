import { organizationSignupSchema } from "@yoga-app/shared";
import { z } from "zod";

// Post-signup "individual or organization" prompt — catches users who never
// answered at signup time (e.g. auto-registered via the Login tab's Google
// button, which can't collect org details before the account is created).
export const completeOnboardingBodySchema = z.discriminatedUnion("accountType", [
  z.object({ accountType: z.literal("individual") }),
  z.object({ accountType: z.literal("company"), organization: organizationSignupSchema }),
]);

export const saveAcquisitionSchema = z.object({
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  utmTerm: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  landingPage: z.string().optional().nullable(),
});

export const savePreferencesSchema = z.object({
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().optional().nullable(),
  purposes: z.array(z.string()).min(1),
  otherPurpose: z.string().optional().nullable(),
  preferredTimeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Flexible"]).optional().nullable(),
  timezone: z.string().min(1),
});

export type SaveAcquisitionBody = z.infer<typeof saveAcquisitionSchema>;
export type SavePreferencesBody = z.infer<typeof savePreferencesSchema>;
export type CompleteOnboardingBody = z.infer<typeof completeOnboardingBodySchema>;

export const userSwaggerSchemas = {
  getUserDetail: {
    description: "Get authenticated user details",
    tags: ["User"] as string[],
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        description: "User details",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              name: { type: "string" as const },
              email: { type: "string" as const },
              role: {
                type: "string" as const,
                enum: ["user", "instructor", "admin"],
              },
              emailVerified: { type: "boolean" as const },
              image: { type: "string" as const, nullable: true },
              createdAt: { type: "string" as const },
              updatedAt: { type: "string" as const },
              onboardingCompletedAt: { type: "string" as const, nullable: true },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
      401: {
        description: "Unauthorized",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: { type: "null" as const },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
};
