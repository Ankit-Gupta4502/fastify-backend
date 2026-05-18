import { format, toZonedTime } from "date-fns-tz";

const DEFAULT_FORMAT = "MMM d, yyyy h:mm a zzz";
const COMPACT_FORMAT = "EEE, MMM d • h:mm a";

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatInTimezone(
  isoOrDate: string | Date,
  timezone: string = browserTimezone(),
  pattern: string = DEFAULT_FORMAT,
): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) return "";
  const zoned = toZonedTime(date, timezone);
  return format(zoned, pattern, { timeZone: timezone });
}

export function formatCompact(
  isoOrDate: string | Date,
  timezone: string = browserTimezone(),
): string {
  return formatInTimezone(isoOrDate, timezone, COMPACT_FORMAT);
}

export function relativeFromNow(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;

  const sign = diffMs >= 0 ? "in" : "ago";
  if (abs < min) return diffMs >= 0 ? "in moments" : "just now";
  if (abs < hour) return `${sign === "in" ? "in " : ""}${Math.round(abs / min)}m${sign === "ago" ? " ago" : ""}`;
  if (abs < day) return `${sign === "in" ? "in " : ""}${Math.round(abs / hour)}h${sign === "ago" ? " ago" : ""}`;
  return `${sign === "in" ? "in " : ""}${Math.round(abs / day)}d${sign === "ago" ? " ago" : ""}`;
}

export function userTimezone(): string {
  return browserTimezone();
}
