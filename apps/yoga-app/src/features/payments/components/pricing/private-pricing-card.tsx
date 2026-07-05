import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, Loader2, Lock, Minus, Plus, BadgeCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlanPrice } from "@/features/payments/hooks/use-plan-price";
import {
  MIN_SESSIONS,
  PRICE_DISCOUNT_CENTS,
  PRICE_DISCOUNT_INR_PAISE,
} from "./pricing-config";

export interface PrivatePricingCardProps {
  sessionCount: number;
  onSessionCountChange: (n: number) => void;
  pricePerSessionCents: number | null;
  pricePerSessionInrPaise: number | null;
  isAuthenticated: boolean;
  isPending: boolean;
  isActive?: boolean;
  isIndia?: boolean;
  activeSessions?: number | null;
  onSubscribe: () => void;
}

const privatePerks = [
  "Private 1:1 sessions with your instructor",
  "Time-of-day flexibility",
  "Priority support",
];

export function PrivatePricingCard({ sessionCount, onSessionCountChange, pricePerSessionCents, pricePerSessionInrPaise, isAuthenticated, isPending, isActive, isIndia, activeSessions, onSubscribe }: PrivatePricingCardProps) {
  const { display: priceDisplay } = usePlanPrice({
    isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise,
    quantity: sessionCount, discountCents: PRICE_DISCOUNT_CENTS, discountInrPaise: PRICE_DISCOUNT_INR_PAISE,
  });
  const { display: basePriceDisplay } = usePlanPrice({
    isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise,
    quantity: MIN_SESSIONS, discountCents: PRICE_DISCOUNT_CENTS, discountInrPaise: PRICE_DISCOUNT_INR_PAISE,
  });
  const { display: rateDisplay } = usePlanPrice({ isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise });
  const { display: discountDisplay } = usePlanPrice({ isIndia, priceCents: PRICE_DISCOUNT_CENTS, priceInrPaise: PRICE_DISCOUNT_INR_PAISE });

  return (
    <div className="relative">
      {/* Floating badge above card */}
      {!isActive && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap bg-primary text-primary-foreground shadow-primary/25">
          <Sparkles className="size-2.5" />
          Most Popular
        </div>
      )}

      <div className="group relative flex flex-col overflow-hidden rounded-4xl border transition-all duration-500 hover:-translate-y-1.5 bg-card border-primary/30 shadow-2xl shadow-primary/10 sketch-border-lg">
        <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/12 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

        {isActive && (
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/25">
            <BadgeCheck className="size-2.5" />
            Current Plan
          </div>
        )}

        <div className="relative pt-7 pb-3 px-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl flex items-center justify-center shrink-0 bg-primary/12 text-primary">
              <Lock className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Private 1:1</h3>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Personalised sessions with your chosen instructor.</p>
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
              : <p className="text-[11px] text-muted-foreground">Billed monthly · {discountDisplay} off · Cancel any time</p>
            }
          </div>
        </div>

        <div className="mx-7 h-px bg-border/40" />

        <div className="flex-1 px-7 py-4 space-y-2.5">
          {privatePerks.map((perk) => (
            <div key={perk} className="flex items-start gap-3">
              <div className="size-4.5 rounded-full flex items-center justify-center shrink-0 mt-px bg-primary/12">
                <Check className="size-2.5 text-primary" />
              </div>
              <span className="text-sm text-foreground/75 leading-snug">{perk}</span>
            </div>
          ))}
        </div>

        <div className="px-7 pb-6 pt-1">
          <div className="relative group/cta">
            <div className="doodle-glow-ring" />
            {isAuthenticated ? (
              <Button
                className="relative w-full h-12 rounded-2xl font-bold gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-300"
                disabled={isPending || (isActive && activeSessions === sessionCount)}
                onClick={onSubscribe}
              >
                {isPending ? (
                  <><Loader2 className="size-4 animate-spin" />Opening checkout…</>
                ) : isActive && activeSessions === sessionCount ? (
                  <><BadgeCheck className="size-4" />Current Plan</>
                ) : (
                  <>Get Private 1:1<ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" /></>
                )}
              </Button>
            ) : (
              <Button
                asChild
                className="relative w-full h-12 rounded-2xl font-bold gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-300"
              >
                <Link to="/login">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
