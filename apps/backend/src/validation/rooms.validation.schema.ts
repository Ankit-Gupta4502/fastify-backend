import { z } from "zod";

export const roomIdParamsSchema = z.object({
  id: z.uuid("Invalid room id"),
});

export const privateBookingBodySchema = z
  .object({
    instructorId: z.uuid("Invalid instructor id"),
    startUtc: z.iso.datetime({ offset: true }),
    endUtc: z.iso.datetime({ offset: true }),
  })
  .refine((v) => new Date(v.endUtc) > new Date(v.startUtc), {
    message: "endUtc must be after startUtc",
    path: ["endUtc"],
  });

export type RoomIdParams = z.infer<typeof roomIdParamsSchema>;
export type PrivateBookingBody = z.infer<typeof privateBookingBodySchema>;

export const roomsSwaggerSchemas = {
  listUpcomingGroup: {
    description: "List upcoming joinable group rooms (localised times)",
    tags: ["Rooms"] as string[],
    security: [{ cookieAuth: [] }],
  },
  join: {
    description: "Join a group room — atomic quota + occupancy check",
    tags: ["Rooms"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["id"],
      properties: { id: { type: "string" as const, format: "uuid" } },
    },
  },
  leave: {
    description: "Leave a room you are currently in",
    tags: ["Rooms"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["id"],
      properties: { id: { type: "string" as const, format: "uuid" } },
    },
  },
  privateBook: {
    description: "Book a private 1:1 session with a specific instructor",
    tags: ["Rooms"] as string[],
    security: [{ cookieAuth: [] }],
    body: {
      type: "object" as const,
      required: ["instructorId", "startUtc", "endUtc"],
      properties: {
        instructorId: { type: "string" as const, format: "uuid" },
        startUtc: { type: "string" as const, format: "date-time" },
        endUtc: { type: "string" as const, format: "date-time" },
      },
    },
  },
};
