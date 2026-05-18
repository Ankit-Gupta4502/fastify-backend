import { format, toZonedTime } from "date-fns-tz";
import { INSTRUCTOR_TIMEZONE } from "../constants/sessions";

const DISPLAY_FORMAT = "MMM d, yyyy h:mm a zzz";

export function formatForUser(utcDate: Date, ianaTimezone: string): string {
  const zoned = toZonedTime(utcDate, ianaTimezone);
  return format(zoned, DISPLAY_FORMAT, { timeZone: ianaTimezone });
}

export function formatForInstructor(utcDate: Date): string {
  return formatForUser(utcDate, INSTRUCTOR_TIMEZONE);
}

export function formatForAudience(
  utcDate: Date,
  audience: { role: string; timezone?: string | null },
): string {
  if (audience.role === "instructor") {
    return formatForInstructor(utcDate);
  }
  return formatForUser(utcDate, audience.timezone || "UTC");
}
