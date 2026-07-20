import { z } from "zod";
import type { AvailabilityWindow } from "@yoga-app/shared";
import { AVAILABILITY_DAYS } from "@/shared/constants";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

const availabilitySlotSchema = z
  .object({
    start: z.string().regex(TIME_REGEX, "Invalid time"),
    end: z.string().regex(TIME_REGEX, "Invalid time"),
  })
  .refine((slot) => slot.start < slot.end, {
    message: "End time must be after start time",
    path: ["end"],
  });

export const availabilityFormSchema = z.object({
  days: z.array(
    z.object({
      dow: z.number(),
      enabled: z.boolean(),
      slots: z.array(availabilitySlotSchema),
    }),
  ),
}).superRefine(({ days }, context) => {
  days.filter((day) => day.enabled).forEach((day, dayIndex) => {
    const ordered = day.slots
      .map((slot, slotIndex) => ({ ...slot, slotIndex }))
      .sort((a, b) => a.start.localeCompare(b.start));

    ordered.forEach((slot, index) => {
      const previous = ordered[index - 1];
      if (previous && slot.start < previous.end) {
        context.addIssue({
          code: "custom",
          message: "Time slots on the same day cannot overlap",
          path: ["days", dayIndex, "slots", slot.slotIndex, "start"],
        });
      }
    });
  });
});

export type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

export function getAvailabilityFormDefaults(windows: AvailabilityWindow[]): AvailabilityFormValues {
  const byDow = new Map<number, AvailabilityWindow[]>();
  windows.forEach((window) => {
    byDow.set(window.dow, [...(byDow.get(window.dow) ?? []), window]);
  });

  return {
    days: AVAILABILITY_DAYS.map(({ dow }) => {
      const slots = byDow.get(dow) ?? [];
      return {
        dow,
        enabled: slots.length > 0,
        slots: slots.length > 0 ? slots.map(({ start, end }) => ({ start, end })) : [{ start: DEFAULT_START, end: DEFAULT_END }],
      };
    }),
  };
}

export function toAvailabilityPayload(values: AvailabilityFormValues): AvailabilityWindow[] {
  return values.days
    .filter((d) => d.enabled)
    .flatMap((day) => day.slots.map((slot) => ({ dow: day.dow, ...slot })));
}
