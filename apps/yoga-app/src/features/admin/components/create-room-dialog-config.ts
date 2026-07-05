import { toZonedTime, format as tzFormat } from "date-fns-tz";

export const US_TIMEZONES = [
  { label: "Eastern (ET)", tz: "America/New_York" },
  { label: "Central (CT)", tz: "America/Chicago" },
  { label: "Mountain (MT)", tz: "America/Denver" },
  { label: "Pacific (PT)", tz: "America/Los_Angeles" },
] as const;

export const PREVIEW_ZONES = [
  { label: "UTC", tz: "UTC" },
  { label: "IST", tz: "Asia/Kolkata" },
  { label: "Your local time", tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
] as const;

export function formatInZone(utcDate: Date, tz: string) {
  return tzFormat(toZonedTime(utcDate, tz), "EEE, MMM d · h:mm a", { timeZone: tz });
}

export function utcIsoToZonedFields(utcIso: string, tz: string) {
  const zoned = toZonedTime(new Date(utcIso), tz);
  return {
    date: tzFormat(zoned, "yyyy-MM-dd", { timeZone: tz }),
    time: tzFormat(zoned, "HH:mm", { timeZone: tz }),
  };
}
