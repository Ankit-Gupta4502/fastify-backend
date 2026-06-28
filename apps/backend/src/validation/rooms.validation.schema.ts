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

export const requestPrivateBodySchema = z
  .object({
    requestedStartUtc: z.iso.datetime({ offset: true }),
    requestedEndUtc: z.iso.datetime({ offset: true }),
  })
  .refine((v) => new Date(v.requestedEndUtc) > new Date(v.requestedStartUtc), {
    message: "requestedEndUtc must be after requestedStartUtc",
    path: ["requestedEndUtc"],
  });

export type RoomIdParams = z.infer<typeof roomIdParamsSchema>;
export type PrivateBookingBody = z.infer<typeof privateBookingBodySchema>;
export type RequestPrivateBody = z.infer<typeof requestPrivateBodySchema>;

export const roomsSwaggerSchemas = {
  listUpcomingGroup: {
    description: "List upcoming group rooms — shows rooms until their scheduled end time",
    tags: ["Rooms"] as string[],
    security: [{ cookieAuth: [] }],
  },
  enrol: {
    description: "Reserve a spot in a group session — deducts weekly quota, no live entry yet",
    tags: ["Rooms"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["id"],
      properties: { id: { type: "string" as const, format: "uuid" } },
    },
  },
  join: {
    description: "Enter the live room — requires prior enrolment and session must be starting within 15 min",
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
