import { z } from "zod";
import { INSTRUCTOR_STATUS_VALUES } from "../constants/sessions";

export const listInstructorsQuerySchema = z.object({
  status: z.enum(INSTRUCTOR_STATUS_VALUES as [string, ...string[]]).optional(),
  specialty: z.string().min(1).optional(),
});

export type ListInstructorsQuery = z.infer<typeof listInstructorsQuerySchema>;

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
