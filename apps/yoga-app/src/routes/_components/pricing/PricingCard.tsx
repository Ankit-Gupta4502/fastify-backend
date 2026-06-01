import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, centsToDisplay } from "@/lib/utils";
import { PLAN_COPY } from "../../_user/_components/billing/plan-card";
import type { PlanRecord } from "@yoga-app/shared";
import { planMeta } from "./pricing-config";

export interface PricingCardProps {
  plan: PlanRecord;
  isAuthenticated: boolean;
  isPending: boolean;
  onSubscribe: (plan: PlanRecord) => void;
}

export function PricingCard({ plan, isAuthenticated, isPending, onSubscribe }: PricingCardProps) {
  const copy = PLAN_COPY[plan.name] ?? { title: plan.name.replace(/_/g, " "), tagline: "", perks: [] };
  const meta = planMeta[plan.name] ?? { icon: Sparkles, gradient: "from-primary/10 to-transparent", iconBg: "bg-primary/10 text-primary", shimmer: "from-transparent via-primary/40 to-transparent" };
  const isPremium = plan.name === "private";
  const PlanIcon = meta.icon;

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-4xl border transition-all duration-500 hover:-translate-y-1.5",
      isPremium
        ? "bg-card border-primary/25 shadow-2xl shadow-primary/8 md:scale-[1.03]"
        : "bg-card/70 border-border/50 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:border-primary/20"
    )}>
      <div className={cn("absolute inset-x-0 top-0 h-48 bg-linear-to-b pointer-events-none", meta.gradient)} />
      <div className={cn(
        "absolute inset-x-0 top-0 h-px bg-linear-to-r pointer-events-none transition-opacity",
        meta.shimmer,
        isPremium ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />

      {meta.badge && (
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
          <Sparkles className="size-2.5" />
          {meta.badge}
        </div>
      )}

      <div className="relative pt-7 pb-5 px-7 space-y-4">
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
            <span className="text-[3.25rem] font-doodle text-primary tracking-tight leading-none">
              {centsToDisplay(plan.priceCents)}
            </span>
            <span className="text-muted-foreground text-sm font-medium pb-1">/ mo</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Billed monthly · Cancel any time</p>
        </div>
      </div>

      <div className="mx-7 h-px bg-border/40" />

      <div className="flex-1 px-7 py-4 space-y-2.5">
        {copy.perks.map((perk) => (
          <div key={perk} className="flex items-start gap-3">
            <div className={cn(
              "size-[18px] rounded-full flex items-center justify-center shrink-0 mt-px",
              isPremium ? "bg-primary/12" : "bg-primary/8"
            )}>
              <Check className="size-2.5 text-primary" />
            </div>
            <span className="text-sm text-foreground/75 leading-snug">{perk}</span>
          </div>
        ))}
      </div>

      <div className="px-7 pb-6 pt-1">
        {isAuthenticated ? (
          <Button
            className={cn(
              "w-full h-12 rounded-2xl font-bold gap-2 text-sm transition-all duration-300",
              isPremium
                ? "shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01]"
                : "border-[1.5px] border-border/70 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/15"
            )}
            variant={isPremium ? "default" : "outline"}
            disabled={isPending}
            onClick={() => onSubscribe(plan)}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Opening checkout…
              </>
            ) : (
              <>
                Get {copy.title}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        ) : (
          <Button
            asChild
            className={cn(
              "w-full h-12 rounded-2xl font-bold gap-2 text-sm transition-all duration-300",
              isPremium
                ? "shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01]"
                : "border-[1.5px] border-border/70 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/15"
            )}
            variant={isPremium ? "default" : "outline"}
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
