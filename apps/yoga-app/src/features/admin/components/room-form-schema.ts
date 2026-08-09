import { zodResolver } from "@hookform/resolvers/zod";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";

function toUtc(date: string, time: string, tz: string): Date | null {
  if (!date || !time || !tz) return null;
  try {
    return fromZonedTime(`${date}T${time}:00`, tz);
  } catch {
    return null;
  }
}

// Sentinel for "no organization restriction" — a native <select> can't carry
// a real null value, and Radix Select disallows empty-string item values.
export const PUBLIC_ORGANIZATION_VALUE = "public";

export const roomFormSchema = z
  .object({
    instructorId: z.string().min(1, "Please select an instructor."),
    name: z.string().max(100, "Keep it under 100 characters."),
    tz: z.string().min(1),
    date: z.string().min(1, "Start date is required."),
    startTime: z.string().min(1, "Start time is required."),
    endDate: z.string().min(1, "End date is required."),
    endTime: z.string().min(1, "End time is required."),
    capacity: z.number().int().min(2).max(50),
    // Required — group classes join via Google Meet only, no 100ms fallback room.
    meetLink: z.string().refine((v) => v.trim().startsWith("https://"), {
      message: "A Google Meet link is required.",
    }),
    // PUBLIC_ORGANIZATION_VALUE = visible/joinable by everyone. Otherwise an
    // organization id — restricted to that org's joined members.
    organizationId: z.string().min(1),
  })
  .refine((v) => toUtc(v.date, v.startTime, v.tz) !== null, {
    message: "Enter a valid start date and time.",
    path: ["startTime"],
  })
  .refine((v) => toUtc(v.endDate, v.endTime, v.tz) !== null, {
    message: "Enter a valid end date and time.",
    path: ["endTime"],
  })
  .refine(
    (v) => {
      const start = toUtc(v.date, v.startTime, v.tz);
      const end = toUtc(v.endDate, v.endTime, v.tz);
      return !start || !end || end > start;
    },
    { message: "End must be after start.", path: ["endTime"] },
  );

export type RoomFormValues = z.infer<typeof roomFormSchema>;

export const DEFAULT_ROOM_FORM: RoomFormValues = {
  instructorId: "",
  name: "",
  tz: "America/New_York",
  date: "",
  startTime: "07:00",
  endDate: "",
  endTime: "08:00",
  capacity: 20,
  meetLink: "",
  organizationId: PUBLIC_ORGANIZATION_VALUE,
};

export const roomFormOptions = {
  resolver: zodResolver(roomFormSchema),
  defaultValues: DEFAULT_ROOM_FORM,
};
