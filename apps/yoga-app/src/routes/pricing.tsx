import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check, ShieldCheck, ArrowRight, Loader2, Users, Lock,
  Sparkles, Zap, CreditCard, RefreshCcw, BadgeCheck, HeartHandshake,
  Minus, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, centsToDisplay } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { usePlansWithPricing } from "@/hooks/use-plans";
import { useCheckout, useCustomCheckout } from "@/hooks/use-checkout";
import { PLAN_COPY } from "./_user/_components/billing/plan-card";
import type { PlanRecord } from "@yoga-app/shared";

const PRICE_PER_SESSION_CENTS = 2000;
const PRICE_DISCOUNT_CENTS = 100;
const MIN_SESSIONS = 4;
function calcPrivatePrice(sessions: number) {
  return sessions * PRICE_PER_SESSION_CENTS - PRICE_DISCOUNT_CENTS;
}

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const planMeta: Record<string, {
  icon: React.ElementType;
  badge?: string;
  gradient: string;
  iconBg: string;
  shimmer: string;
}> = {
  group_live: {
    icon: Users,
    gradient: "from-sky-500/8 via-blue-400/4 to-transparent",
    iconBg: "bg-sky-500/10 text-sky-500",
    shimmer: "from-transparent via-sky-400/40 to-transparent",
  },
  private: {
    icon: Lock,
    gradient: "from-primary/12 via-primary/5 to-transparent",
    iconBg: "bg-primary/12 text-primary",
    shimmer: "from-transparent via-primary/50 to-transparent",
  },
};

const faqs = [
  {
    icon: RefreshCcw,
    q: "Can I switch plans?",
    a: "Upgrade or downgrade any time from your dashboard. Changes take effect on your next billing date — no penalties.",
  },
  {
    icon: Sparkles,
    q: "Is there a free trial?",
    a: "Every new account gets a 14-day free trial of Group Live features. No credit card required to start.",
  },
  {
    icon: Zap,
    q: "How does the session quota work?",
    a: "Your weekly session count resets every Monday at midnight UTC. Unused sessions don't carry over to the next week.",
  },
  {
    icon: CreditCard,
    q: "What payment methods are accepted?",
    a: "All major credit/debit cards and UPI via Razorpay. We never store your card information on our servers.",
  },
];

const trustSignals = [
  { icon: ShieldCheck, label: "256-bit SSL encryption" },
  { icon: BadgeCheck, label: "Razorpay certified" },
  { icon: RefreshCcw, label: "Cancel any time" },
  { icon: HeartHandshake, label: "30-day money back" },
];

function PricingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const plans = usePlansWithPricing();
  const checkout = useCheckout();
  const customCheckout = useCustomCheckout();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(MIN_SESSIONS);

  // API now only returns group_live; custom private is handled by the stepper card below
  const groupPlan = plans.data?.data?.[0] ?? null;
  const isLoading = authLoading || plans.isLoading;
  const isPending = checkout.isPending || customCheckout.isPending;

  const handleSubscribe = (plan: PlanRecord) => {
    setError(null);
    setSuccess(null);
    checkout.mutate(plan.id, {
      onSuccess: () => setSuccess(`You're now on ${PLAN_COPY[plan.name]?.title ?? plan.name}!`),
      onError: (err) => setError(err instanceof Error ? err.message : "Payment failed"),
    });
  };

  const handlePrivateSubscribe = () => {
    setError(null);
    setSuccess(null);
    customCheckout.mutate(sessionCount, {
      onSuccess: () => setSuccess(`Private plan activated — ${sessionCount} sessions/mo`),
      onError: (err) => setError(err instanceof Error ? err.message : "Payment failed"),
    });
  };

  return (
    <div className="relative">
      {/* Page-level ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] bg-primary/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 size-[400px] bg-sky-500/4 blur-[100px] rounded-full" />
      </div>

      <div className="py-10 md:py-16 space-y-16">
        {/* ── Hero ── */}
        <div className="text-center max-w-2xl mx-auto space-y-6 px-4">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 px-4 py-1.5 rounded-full">
            <Zap className="size-3 fill-primary text-primary" />
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Simple Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.05]">
            Invest in your
            <br />
            <span className="italic text-primary">inner peace</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Two honest plans. No hidden fees. No first-month discounts. Just the same fair price, always.
          </p>
        </div>

        {/* ── Feedback ── */}
        {(error || success) && (
          <div className="max-w-lg mx-auto px-4">
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive px-6 py-4 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 px-6 py-4 text-sm text-center font-medium">
                {success}
              </div>
            )}
          </div>
        )}

        {/* ── Plan Cards ── */}
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-[540px] rounded-4xl" />
              <Skeleton className="h-[540px] rounded-4xl" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {groupPlan && (
                <PricingCard
                  plan={groupPlan}
                  isAuthenticated={isAuthenticated}
                  isPending={isPending}
                  onSubscribe={handleSubscribe}
                />
              )}
              <PrivatePricingCard
                sessionCount={sessionCount}
                onSessionCountChange={setSessionCount}
                isAuthenticated={isAuthenticated}
                isPending={isPending}
                onSubscribe={handlePrivateSubscribe}
              />
            </div>
          )}

          {!isLoading && (
            <p className="text-center text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/60">Group Live</span> — perfect for getting started with live classes.{" "}
              <span className="font-semibold text-foreground/60">Private 1:1</span> — personalised sessions starting at {centsToDisplay(calcPrivatePrice(MIN_SESSIONS))}/mo.
            </p>
          )}
        </div>

        {/* ── Not signed in CTA ── */}
        {!isAuthenticated && !authLoading && (
          <div className="max-w-sm mx-auto px-4 text-center space-y-5">
            <div className="space-y-1">
              <p className="font-semibold text-lg">Ready to begin?</p>
              <p className="text-sm text-muted-foreground">Free account, no card needed to start.</p>
            </div>
            <Button asChild size="lg" className="rounded-full px-10 gap-2 font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Link to="/login">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── FAQ ── */}
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-3">
            <p className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Got questions?</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Common Questions
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {faqs.map((faq) => {
              const Icon = faq.icon;
              return (
                <div
                  key={faq.q}
                  className="group relative p-6 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 space-y-3"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                      <Icon className="size-3.5 text-primary" />
                    </div>
                    <h4 className="font-bold text-sm leading-tight">{faq.q}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed pl-11">
                    {faq.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Trust / Security ── */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-4xl border border-border/40 bg-card/40 backdrop-blur-sm p-7 md:p-10">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-sky-500/4 pointer-events-none" />
            <div className="absolute -top-20 -right-20 size-64 bg-primary/6 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 size-64 bg-sky-500/6 blur-3xl rounded-full pointer-events-none" />

            <div className="relative space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="size-16 rounded-3xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight">Safe & Secure Payments</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                    Your payment is processed end-to-end by Razorpay — one of India's most trusted payment gateways. We never see or store your card details.
                  </p>
                </div>
              </div>

              {/* Trust signals grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {trustSignals.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-background/60 border border-border/40 text-center hover:border-primary/20 transition-colors">
                    <div className="size-9 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Powered by */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <CreditCard className="size-4 text-muted-foreground/50 shrink-0" />
                <p className="text-xs text-muted-foreground/60">
                  Powered by <span className="font-semibold text-muted-foreground">Razorpay</span> · Accepts Visa, Mastercard, RuPay, UPI, Net Banking &amp; more
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PrivatePricingCardProps {
  sessionCount: number;
  onSessionCountChange: (n: number) => void;
  isAuthenticated: boolean;
  isPending: boolean;
  onSubscribe: () => void;
}

const privatePerks = [
  "Private 1:1 sessions with your instructor",
  "Time-of-day flexibility",
  "Direct instructor messaging",
  "Priority support",
];

function PrivatePricingCard({ sessionCount, onSessionCountChange, isAuthenticated, isPending, onSubscribe }: PrivatePricingCardProps) {
  const priceCents = calcPrivatePrice(sessionCount);

  return (
    <div className="relative">
      {/* Badge sits on the wrapper, never clipped by overflow-hidden */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-primary/20 whitespace-nowrap">
        <Sparkles className="size-2.5" />
        Most Popular
      </div>

      <div className="group relative flex flex-col overflow-hidden rounded-4xl border transition-all duration-500 hover:-translate-y-1.5 bg-card border-primary/25 shadow-2xl shadow-primary/8">
        <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/12 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

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

        {/* Session stepper */}
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
            <span className="text-[3.25rem] font-serif font-bold tracking-tight leading-none">
              {centsToDisplay(priceCents)}
            </span>
            <span className="text-muted-foreground text-sm font-medium pb-1">/ mo</span>
          </div>
          {sessionCount > MIN_SESSIONS
            ? <p className="text-[11px] text-muted-foreground">{centsToDisplay(calcPrivatePrice(MIN_SESSIONS))} base · +{centsToDisplay(PRICE_PER_SESSION_CENTS)} per extra session</p>
            : <p className="text-[11px] text-muted-foreground">Billed monthly · Cancel any time</p>
          }
        </div>
      </div>

      <div className="mx-7 h-px bg-border/40" />

      <div className="flex-1 px-7 py-4 space-y-2.5">
        {privatePerks.map((perk) => (
          <div key={perk} className="flex items-start gap-3">
            <div className="size-[18px] rounded-full flex items-center justify-center shrink-0 mt-px bg-primary/12">
              <Check className="size-2.5 text-primary" />
            </div>
            <span className="text-sm text-foreground/75 leading-snug">{perk}</span>
          </div>
        ))}
      </div>

      <div className="px-7 pb-6 pt-1">
        {isAuthenticated ? (
          <Button
            className="w-full h-12 rounded-2xl font-bold gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] transition-all duration-300"
            disabled={isPending}
            onClick={onSubscribe}
          >
            {isPending ? (
              <><Loader2 className="size-4 animate-spin" />Opening checkout…</>
            ) : (
              <>Get Private 1:1<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
            )}
          </Button>
        ) : (
          <Button
            asChild
            className="w-full h-12 rounded-2xl font-bold gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.01] transition-all duration-300"
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

interface PricingCardProps {
  plan: PlanRecord;
  isAuthenticated: boolean;
  isPending: boolean;
  onSubscribe: (plan: PlanRecord) => void;
}

function PricingCard({ plan, isAuthenticated, isPending, onSubscribe }: PricingCardProps) {
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
      {/* Top gradient wash */}
      <div className={cn("absolute inset-x-0 top-0 h-48 bg-linear-to-b pointer-events-none", meta.gradient)} />

      {/* Shimmer line */}
      <div className={cn(
        "absolute inset-x-0 top-0 h-px bg-linear-to-r pointer-events-none transition-opacity",
        meta.shimmer,
        isPremium ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />

      {/* Badge */}
      {meta.badge && (
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
          <Sparkles className="size-2.5" />
          {meta.badge}
        </div>
      )}

      {/* Card header */}
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
            <span className="text-[3.25rem] font-serif font-bold tracking-tight leading-none">
              {centsToDisplay(plan.priceCents)}
            </span>
            <span className="text-muted-foreground text-sm font-medium pb-1">/ mo</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Billed monthly · Cancel any time</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-7 h-px bg-border/40" />

      {/* Perks */}
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

      {/* CTA */}
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
