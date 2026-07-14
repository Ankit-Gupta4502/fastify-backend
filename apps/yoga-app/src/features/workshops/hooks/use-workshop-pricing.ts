import { useMemo } from "react";
import type { Workshop } from "@yoga-app/shared";
import { getStoredUtm } from "@/shared/lib/utm";

export interface WorkshopPricing {
  utmSource: string | null;
  isPaid: boolean;
  displayPriceInr: number | null;
  displayPriceUsd: number | null;
}

/** Single source of truth for whether a workshop is priced via its UTM campaign price for this visitor. */
export function useWorkshopPricing(workshop: Workshop): WorkshopPricing {
  return useMemo(() => {
    const utm = getStoredUtm();
    const utmSource = utm?.utmSource ?? null;
    const isPaid = !!utmSource && (workshop.utmPriceInr > 0 || workshop.utmPriceUsd > 0);
    const displayPriceInr = utmSource ? workshop.utmPriceInr : workshop.priceInr;
    const displayPriceUsd = utmSource ? workshop.utmPriceUsd : workshop.priceUsd;
    return { utmSource, isPaid, displayPriceInr, displayPriceUsd };
  }, [workshop]);
}
