import { z } from "zod";

export const approveInstructorBodySchema = z.object({
  approve: z.boolean(),
});

export const updatePriorityBodySchema = z.object({
  sortOrder: z.number().int().min(0),
});

export const createInstructorBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const instructorIdParamsSchema = z.object({
  id: z.string().uuid("Invalid instructor id"),
});

export const userIdParamsSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["user", "instructor", "admin"]).optional(),
  plan: z.string().optional(),
});

export const createGroupRoomBodySchema = z
  .object({
    instructorId: z.string().uuid(),
    name: z.string().trim().min(1).max(100).optional().nullable(),
    scheduledStartUtc: z.string().datetime(),
    scheduledEndUtc: z.string().datetime(),
    capacity: z.number().int().min(2).max(50).default(20),
    meetLink: z
      .string()
      .url()
      .refine((v) => v.startsWith("https://"), { message: "meetLink must use https" })
      .optional()
      .nullable(),
  })
  .refine((v) => new Date(v.scheduledEndUtc) > new Date(v.scheduledStartUtc), {
    message: "scheduledEndUtc must be after scheduledStartUtc",
    path: ["scheduledEndUtc"],
  })
  .refine((v) => new Date(v.scheduledStartUtc) > new Date(), {
    message: "scheduledStartUtc must be in the future",
    path: ["scheduledStartUtc"],
  });

export const roomIdParamsSchema = z.object({
  id: z.string().uuid("Invalid room id"),
});

export const updateGroupRoomBodySchema = z
  .object({
    instructorId: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(100).optional().nullable(),
    scheduledStartUtc: z.string().datetime().optional(),
    scheduledEndUtc: z.string().datetime().optional(),
    capacity: z.number().int().min(2).max(50).optional(),
    meetLink: z
      .string()
      .url()
      .refine((v) => v.startsWith("https://"), { message: "meetLink must use https" })
      .optional()
      .nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (v) =>
      !v.scheduledStartUtc ||
      !v.scheduledEndUtc ||
      new Date(v.scheduledEndUtc) > new Date(v.scheduledStartUtc),
    {
      message: "scheduledEndUtc must be after scheduledStartUtc",
      path: ["scheduledEndUtc"],
    },
  )
  .refine((v) => !v.scheduledStartUtc || new Date(v.scheduledStartUtc) > new Date(), {
    message: "scheduledStartUtc must be in the future",
    path: ["scheduledStartUtc"],
  });

export const privateRequestIdParamsSchema = z.object({
  id: z.string().uuid("Invalid request id"),
});

export const privateRequestsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export const assignPrivateRequestBodySchema = z.object({
  instructorId: z.string().uuid("Invalid instructor id"),
  adminNote: z.string().max(500).optional().nullable(),
});

export const rejectPrivateRequestBodySchema = z.object({
  adminNote: z.string().max(500).optional().nullable(),
});

export type ApproveInstructorBody = z.infer<typeof approveInstructorBodySchema>;
export type UpdatePriorityBody = z.infer<typeof updatePriorityBodySchema>;
export type CreateInstructorBody = z.infer<typeof createInstructorBodySchema>;
export type InstructorIdParams = z.infer<typeof instructorIdParamsSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type CreateGroupRoomBody = z.infer<typeof createGroupRoomBodySchema>;
export type RoomIdParams = z.infer<typeof roomIdParamsSchema>;
export type UpdateGroupRoomBody = z.infer<typeof updateGroupRoomBodySchema>;
export type PrivateRequestIdParams = z.infer<typeof privateRequestIdParamsSchema>;
export type PrivateRequestsQuery = z.infer<typeof privateRequestsQuerySchema>;
export type AssignPrivateRequestBody = z.infer<typeof assignPrivateRequestBodySchema>;
export type RejectPrivateRequestBody = z.infer<typeof rejectPrivateRequestBodySchema>;
