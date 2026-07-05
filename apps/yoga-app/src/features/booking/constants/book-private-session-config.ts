export const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
] as const;

export const DAYS_OF_WEEK = [
  { label: "Su", full: "Sunday",    value: 0 },
  { label: "Mo", full: "Monday",    value: 1 },
  { label: "Tu", full: "Tuesday",   value: 2 },
  { label: "We", full: "Wednesday", value: 3 },
  { label: "Th", full: "Thursday",  value: 4 },
  { label: "Fr", full: "Friday",    value: 5 },
  { label: "Sa", full: "Saturday",  value: 6 },
] as const;

export const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000; // 2 hours
export const MAX_SLOTS_MANUAL = 5;
export const MAX_SLOTS_RECURRING = 20;
