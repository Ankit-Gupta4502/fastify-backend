import { useMemo } from "react";
import type { Workshop } from "@yoga-app/shared";
import { getStoredUtm } from "@/shared/lib/utm";

export interface WorkshopPricing {
  utmSource: string | null;
  isPaid: boolean;
  currency: "INR" | "USD";
  /** Amount in the smallest currency unit (paise/cents); null/0 means free. */
  price: number | null;
}

/**
 * Single source of truth for a workshop's price/currency, resolved for this visitor's
 * detected country (workshop.isIndia, set server-side) — not just "whichever price field
 * happens to be non-zero", which misrepresents workshops priced free in one currency but
 * paid in the other.
 */
export function useWorkshopPricing(workshop: Workshop): WorkshopPricing {
  return useMemo(() => {
    const utm = getStoredUtm();
    const utmSource = utm?.utmSource ?? null;
    const isIndia = workshop.isIndia ?? true;
    const currency: "INR" | "USD" = isIndia ? "INR" : "USD";
    const price = utmSource
      ? (isIndia ? workshop.utmPriceInr : workshop.utmPriceUsd)
      : (isIndia ? workshop.priceInr : workshop.priceUsd);
    const isPaid = !!utmSource && (price ?? 0) > 0;
    return { utmSource, isPaid, currency, price };
  }, [workshop]);
}
