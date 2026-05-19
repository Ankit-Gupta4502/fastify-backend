import type { UpcomingRoom } from "@yoga-app/shared";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const LIVE_JOIN_WINDOW_MS = 15 * 60 * 1000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}



export function canJoinLive(room: UpcomingRoom): boolean {
  const now = Date.now();
  const start = new Date(room.scheduledStartUtc).getTime();
  const end = new Date(room.scheduledEndUtc).getTime();
  return now >= start - LIVE_JOIN_WINDOW_MS && now < end;
}