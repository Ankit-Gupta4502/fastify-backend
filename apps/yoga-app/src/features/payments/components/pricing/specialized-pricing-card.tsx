import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, Loader2, Minus, Plus, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { usePlanPrice } from "@/features/payments/hooks/use-plan-price";
import { paidAmountToDisplay } from "@/shared/lib/utils";
import { MIN_SESSIONS } from "./pricing-config";
import type { SpecializedPlanConfigEntry } from "./pricing-config";

export interface SpecializedPricingCardProps {
  planName: string;
  config: SpecializedPlanConfigEntry;
  sessionCount: number;
  onSessionCountChange: (n: number) => void;
  pricePerSessionCents: number | null;
  pricePerSessionInrPaise: number | null;
  isAuthenticated: boolean;
  isPending: boolean;
  isActive?: boolean;
  isIndia?: boolean;
  activeSessions?: number | null;
  // The rate actually locked in at signup — shown while the selector still
  // matches the active session count, since the live catalog price/currency
  // may have moved on since the subscription started.
  activePricePaidCents?: number | null;
  activeCurrency?: string | null;
  onSubscribe: () => void;
}

export function SpecializedPricingCard({
  config,
  sessionCount,
  onSessionCountChange,
  pricePerSessionCents,
  pricePerSessionInrPaise,
  isAuthenticated,
  isPending,
  isActive,
  isIndia,
  activeSessions,
  activePricePaidCents,
  activeCurrency,
  onSubscribe,
}: SpecializedPricingCardProps) {
  const { display: livePriceDisplay } = usePlanPrice({
    isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise, quantity: sessionCount,
  });
  const showActivePrice = isActive && activeSessions === sessionCount && activePricePaidCents != null;
  const priceDisplay = showActivePrice
    ? paidAmountToDisplay(activePricePaidCents, activeCurrency ?? null)
    : livePriceDisplay;
  const { display: basePriceDisplay } = usePlanPrice({
    isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise, quantity: MIN_SESSIONS,
  });
  const { display: rateDisplay } = usePlanPrice({ isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise });
  const PlanIcon = config.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-4xl border transition-all duration-500 hover:-translate-y-1.5 bg-card/70 border-border/50 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:border-primary/20">
      {isActive && (
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/25">
          <BadgeCheck className="size-2.5" />
          {activeSessions ? `${activeSessions} sessions active` : "Current Plan"}
        </div>
      )}
      <div className={cn("absolute inset-x-0 top-0 h-48 bg-linear-to-b pointer-events-none", config.gradient)} />
      <div className={cn("absolute inset-x-0 top-0 h-px bg-linear-to-r pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity", config.shimmer)} />

      <div className="relative pt-7 pb-3 px-7 space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn("size-11 rounded-2xl flex items-center justify-center shrink-0", config.iconBg)}>
            <PlanIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{config.title}</h3>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{config.tagline}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            disabled={sessionCount <= MIN_SESSIONS || isPending}
            onClick={() => onSessionCountChange(sessionCount - 1)}
          >
            <Minus className="size-3" />
          </Button>
          <span className="text-sm font-semibold w-28 text-center">{sessionCount} sessions/mo</span>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            disabled={isPending}
            onClick={() => onSessionCountChange(sessionCount + 1)}
          >
            <Plus className="size-3" />
          </Button>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[3.25rem] font-doodle text-primary tracking-tight leading-none transition-all duration-300">
              {priceDisplay}
            </span>
            <span className="text-muted-foreground text-sm font-medium pb-1">/ mo</span>
          </div>
          {sessionCount > MIN_SESSIONS
            ? <p className="text-[11px] text-muted-foreground">{basePriceDisplay} base · +{rateDisplay} per extra session</p>
            : <p className="text-[11px] text-muted-foreground">Billed monthly · Cancel any time</p>
          }
        </div>
      </div>

      <div className="mx-7 h-px bg-border/40" />

      <div className="flex-1 px-7 py-4 space-y-2.5">
        {config.perks.map((perk) => (
          <div key={perk} className="flex items-start gap-3">
            <div className="size-4.5 rounded-full flex items-center justify-center shrink-0 mt-px bg-primary/8">
              <Check className="size-2.5 text-primary" />
            </div>
            <span className="text-sm text-foreground/75 leading-snug">{perk}</span>
          </div>
        ))}
      </div>

      <div className="px-7 pb-6 pt-1">
        {isAuthenticated ? (
          <Button
            className="w-full h-12 rounded-2xl font-bold gap-2 text-sm border-[1.5px] border-border/70 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/15 transition-all duration-300"
            variant="outline"
            disabled={isPending || (isActive && activeSessions === sessionCount)}
            onClick={onSubscribe}
          >
            {isPending ? (
              <><Loader2 className="size-4 animate-spin" />Opening checkout…</>
            ) : isActive && activeSessions === sessionCount ? (
              <><BadgeCheck className="size-4" />Current Plan</>
            ) : (
              <>Get {config.title}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
            )}
          </Button>
        ) : (
          <Button
            asChild
            className="w-full h-12 rounded-2xl font-bold gap-2 text-sm border-[1.5px] border-border/70 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/15 transition-all duration-300"
            variant="outline"
          >
            <Link to="/login">
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
