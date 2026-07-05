import { centsToDisplay, paiseToDisplay } from "@/shared/lib/utils";

interface UsePlanPriceOptions {
  isIndia?: boolean;
  priceCents?: number | null;
  priceInrPaise?: number | null;
  quantity?: number;
  discountCents?: number;
  discountInrPaise?: number;
}

export interface PlanPrice {
  showInr: boolean;
  amount: number | null;
  display: string;
}

// Shared by every pricing/billing card: pick INR vs USD the same way
// everywhere (isIndia + a non-null priceInrPaise), then compute and format
// the amount for a given quantity/discount. Prices always come from the
// plans API — if the field the current currency needs is missing, we show
// a placeholder rather than a made-up number.
export function usePlanPrice({
  isIndia,
  priceCents,
  priceInrPaise,
  quantity = 1,
  discountCents = 0,
  discountInrPaise = 0,
}: UsePlanPriceOptions): PlanPrice {
  const showInr = Boolean(isIndia) && priceInrPaise != null;
  const rate = showInr ? priceInrPaise : priceCents;

  if (rate == null) {
    return { showInr, amount: null, display: "—" };
  }

  const amount = quantity * rate - (showInr ? discountInrPaise : discountCents);
  return { showInr, amount, display: showInr ? paiseToDisplay(amount) : centsToDisplay(amount) };
}
