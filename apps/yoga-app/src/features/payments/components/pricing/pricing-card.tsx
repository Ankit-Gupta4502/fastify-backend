import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, Loader2, Sparkles, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { PLAN_COPY } from "@/features/payments/utils/plan-copy";
import type { PlanRecord } from "@yoga-app/shared";
import { usePlanPrice } from "@/features/payments/hooks/use-plan-price";
import { planMeta } from "./pricing-config";

export interface PricingCardProps {
  plan: PlanRecord;
  isAuthenticated: boolean;
  isPending: boolean;
  isActive?: boolean;
  isIndia?: boolean;
  onSubscribe: (plan: PlanRecord) => void;
}

export function PricingCard({ plan, isAuthenticated, isPending, isActive, isIndia, onSubscribe }: PricingCardProps) {
  const copy = PLAN_COPY[plan.name] ?? { title: plan.name.replace(/_/g, " "), tagline: "", perks: [] };
  const meta = planMeta[plan.name] ?? {
    icon: Sparkles,
    gradient: "from-primary/10 to-transparent",
    iconBg: "bg-primary/10 text-primary",
    shimmer: "from-transparent via-primary/40 to-transparent",
  };
  const billingLabel = plan.billingInterval === "week" ? "/ wk" : "/ mo";
  const billingNote = plan.billingInterval === "week" ? "Billed weekly · Cancel any time" : "Billed monthly · Cancel any time";
  const isGroupPlan = plan.name === "group_live";
  const PlanIcon = meta.icon;
  const { display: priceDisplay } = usePlanPrice({ isIndia, priceCents: plan.priceCents, priceInrPaise: plan.priceInrPaise });

  return (
    <div className="relative flex flex-col">
      {/* Floating badge above card */}
      {!isActive && meta.badge && (
        <div className={cn(
          "absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap",
          isGroupPlan
            ? "bg-sky-500 text-white shadow-sky-500/30"
            : "bg-primary text-primary-foreground shadow-primary/25"
        )}>
          <Sparkles className="size-2.5" />
          {meta.badge}
        </div>
      )}

      <div className={cn(
        "group relative flex flex-col flex-1 overflow-hidden rounded-4xl border transition-all duration-500 hover:-translate-y-1.5",
        isGroupPlan
          ? "bg-card border-sky-500/30 shadow-2xl shadow-sky-500/10"
          : "bg-card/70 border-border/50 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:border-border/80"
      )}>
        {/* Gradient fill */}
        <div className={cn("absolute inset-x-0 top-0 h-52 bg-linear-to-b pointer-events-none", meta.gradient)} />
        {/* Shimmer line */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-px bg-linear-to-r pointer-events-none transition-opacity",
          meta.shimmer,
          isGroupPlan ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} />

        {isActive && (
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/25">
            <BadgeCheck className="size-2.5" />
            Current Plan
          </div>
        )}

        {/* Header */}
        <div className="relative pt-8 pb-5 px-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("size-11 rounded-2xl flex items-center justify-center shrink-0", meta.iconBg)}>
              <PlanIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{copy.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{copy.tagline}</p>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className={cn(
                "text-[3.25rem] font-doodle tracking-tight leading-none",
                isGroupPlan ? "text-sky-500" : "text-primary"
              )}>
                {priceDisplay}
              </span>
              <span className="text-muted-foreground text-sm font-medium pb-1">{billingLabel}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{billingNote}</p>
          </div>
        </div>

        <div className="mx-7 h-px bg-border/40" />

        {/* Perks */}
        <div className="flex-1 px-7 py-5 space-y-2.5">
          {copy.perks.map((perk) => (
            <div key={perk} className="flex items-start gap-3">
              <div className={cn(
                "size-4.5 rounded-full flex items-center justify-center shrink-0 mt-px",
                isGroupPlan ? "bg-sky-500/12" : "bg-primary/8"
              )}>
                <Check className={cn("size-2.5", isGroupPlan ? "text-sky-500" : "text-primary")} />
              </div>
              <span className="text-sm text-foreground/75 leading-snug">{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-7 pb-7 pt-1">
          {isAuthenticated ? (
            <Button
              className={cn(
                "w-full h-12 rounded-2xl font-bold gap-2 text-sm transition-all duration-300",
                isGroupPlan
                  ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01]"
                  : "border-[1.5px] border-border/70 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/15"
              )}
              variant="outline"
              disabled={isPending || isActive}
              onClick={() => onSubscribe(plan)}
            >
              {isPending ? (
                <><Loader2 className="size-4 animate-spin" />Opening checkout…</>
              ) : isActive ? (
                <><BadgeCheck className="size-4" />Current Plan</>
              ) : (
                <>Get {copy.title}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </Button>
          ) : (
            <Button
              asChild
              className={cn(
                "w-full h-12 rounded-2xl font-bold gap-2 text-sm transition-all duration-300",
                isGroupPlan
                  ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01]"
                  : "border-[1.5px] border-border/70 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/15"
              )}
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
    </div>
  );
}
