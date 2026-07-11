import { z } from "zod";
import { INSTRUCTOR_STATUS_VALUES } from "../constants/sessions";

export const listInstructorsQuerySchema = z.object({
  status: z.enum(INSTRUCTOR_STATUS_VALUES as [string, ...string[]]).optional(),
  specialty: z.string().min(1).optional(),
});

export type ListInstructorsQuery = z.infer<typeof listInstructorsQuerySchema>;

export const updateInstructorProfileBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(120).optional(),
  profileImageUrl: z.url().optional().nullable(),
  avatarKey: z.string().optional().nullable(),
  introVideoUrl: z.url().optional().nullable(),
  introVideoKey: z.string().optional().nullable(),
  tags: z.array(z.string().max(40)).max(10).optional(),
  yearsOfExperience: z.number().int().min(0).max(60).optional().nullable(),
});

export type UpdateInstructorProfileBody = z.infer<typeof updateInstructorProfileBodySchema>;

export const instructorsSwaggerSchemas = {
  list: {
    description: "List instructors, optionally filtered by status/specialty",
    tags: ["Instructors"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      properties: {
        status: {
          type: "string" as const,
          enum: INSTRUCTOR_STATUS_VALUES,
        },
        specialty: { type: "string" as const },
      },
    },
  },
  mySchedule: {
    description: "Current instructor's upcoming rooms (IST)",
    tags: ["Instructors"] as string[],
    security: [{ cookieAuth: [] }],
  },
};
