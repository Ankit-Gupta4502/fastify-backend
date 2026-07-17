import { z } from "zod";
import type { AvailabilityWindow } from "@yoga-app/shared";
import { AVAILABILITY_DAYS } from "@/shared/constants";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

export const availabilityFormSchema = z.object({
  days: z.array(
    z
      .object({
        dow: z.number(),
        enabled: z.boolean(),
        start: z.string().regex(TIME_REGEX, "Invalid time"),
        end: z.string().regex(TIME_REGEX, "Invalid time"),
      })
      .refine((d) => !d.enabled || d.start < d.end, {
        message: "End time must be after start time",
        path: ["end"],
      }),
  ),
});

export type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

export function getAvailabilityFormDefaults(windows: AvailabilityWindow[]): AvailabilityFormValues {
  const byDow = new Map(windows.map((w) => [w.dow, w]));
  return {
    days: AVAILABILITY_DAYS.map(({ dow }) => {
      const existing = byDow.get(dow);
      return {
        dow,
        enabled: Boolean(existing),
        start: existing?.start ?? DEFAULT_START,
        end: existing?.end ?? DEFAULT_END,
      };
    }),
  };
}

export function toAvailabilityPayload(values: AvailabilityFormValues): AvailabilityWindow[] {
  return values.days
    .filter((d) => d.enabled)
    .map((d) => ({ dow: d.dow, start: d.start, end: d.end }));
}
