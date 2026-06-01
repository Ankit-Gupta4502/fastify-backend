export const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
] as const;

export const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000; // 2 hours
