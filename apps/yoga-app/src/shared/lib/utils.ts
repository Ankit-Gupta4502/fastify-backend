import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function paiseToDisplay(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

// currency is null for rows purchased before it was tracked — fall back to USD
// display rather than guessing from the viewer's current geo.
export function paidAmountToDisplay(amount: number, currency: string | null): string {
  return currency === "INR" ? paiseToDisplay(amount) : centsToDisplay(amount);
}
