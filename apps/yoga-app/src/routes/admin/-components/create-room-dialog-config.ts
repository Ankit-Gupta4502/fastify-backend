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

export interface FormState {
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  tz: string;
  meetLink: string;
}

export const DEFAULT_FORM: FormState = {
  instructorId: "",
  date: "",
  startTime: "07:00",
  endTime: "08:00",
  capacity: 20,
  tz: "America/New_York",
  meetLink: "",
};

export function formatInZone(utcDate: Date, tz: string) {
  return tzFormat(toZonedTime(utcDate, tz), "EEE, MMM d · h:mm a", { timeZone: tz });
}
