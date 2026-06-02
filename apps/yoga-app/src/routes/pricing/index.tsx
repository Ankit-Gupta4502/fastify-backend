import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowRight, Zap, CreditCard } from "lucide-react";

import { StarDoodle, CircleDoodle, PlusDoodle } from "@/components/shared/doodles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, centsToDisplay } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { usePlansWithPricing } from "@/hooks/use-plans";
import { useCheckout, useCustomCheckout } from "@/hooks/use-checkout";
import { PLAN_COPY } from "@/lib/plan-copy";
import type { PlanRecord } from "@yoga-app/shared";

import {
  MIN_SESSIONS,
  specializedPlanConfig,
  faqs,
  trustSignals,
  calcPrivatePrice,
  calcSpecializedPrice,
} from "./-components/pricing-config";
import { PricingCard } from "./-components/PricingCard";
import { PrivatePricingCard } from "./-components/PrivatePricingCard";
import { SpecializedPricingCard } from "./-components/SpecializedPricingCard";

type Tab = "standard" | "specialized";

export const Route = createFileRoute("/pricing/")({
  component: PricingPage,
});

function PricingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const plans = usePlansWithPricing();
  const checkout = useCheckout();
  const customCheckout = useCustomCheckout();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("standard");
  const [sessionCount, setSessionCount] = useState(MIN_SESSIONS);
  const [prenatalSessions, setPrenatalSessions] = useState(MIN_SESSIONS);
  const [therapeuticSessions, setTherapeuticSessions] = useState(MIN_SESSIONS);

  const groupPlan = plans.data?.data?.find((p) => p.name === "group_live") ?? null;
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
    customCheckout.mutate({ sessionCount, planName: "private" }, {
      onSuccess: () => setSuccess(`Private plan activated — ${sessionCount} sessions/mo`),
      onError: (err) => setError(err instanceof Error ? err.message : "Payment failed"),
    });
  };

  const handleSpecializedSubscribe = (planName: string, sessions: number) => {
    setError(null);
    setSuccess(null);
    const title = specializedPlanConfig[planName]?.title ?? planName;
    customCheckout.mutate({ sessionCount: sessions, planName }, {
      onSuccess: () => setSuccess(`${title} activated — ${sessions} sessions/mo`),
      onError: (err) => setError(err instanceof Error ? err.message : "Payment failed"),
    });
  };

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[700px] bg-primary/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 size-[450px] bg-sky-500/4 blur-[110px] rounded-full" />
        <div className="absolute top-1/2 left-0 size-[300px] bg-accent/4 blur-[90px] rounded-full" />
      </div>

      {/* Floating doodle decorations */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <StarDoodle className="absolute top-20 right-[8%] size-7 text-primary/20 animate-doodle-float" />
        <CircleDoodle className="absolute top-10 left-[4%] size-32 text-primary/7 animate-doodle-spin-slow" />
        <PlusDoodle className="absolute top-[40%] right-[3%] size-5 text-primary/15 animate-doodle-float-alt" style={{ animationDelay: '1.5s' }} />
        <StarDoodle className="absolute top-[55%] left-[6%] size-4 text-accent/30 animate-doodle-float" style={{ animationDelay: '2s' }} />
        <CircleDoodle className="absolute bottom-[20%] right-[5%] size-44 text-accent/6 animate-doodle-spin-rev" />
        <StarDoodle className="absolute top-[25%] left-[12%] size-2.5 text-primary/25 animate-doodle-float-alt" style={{ animationDelay: '0.8s' }} />
      </div>

      <div className="py-10 md:py-16 space-y-16">
        {/* ── Hero ── */}
        <div className="text-center max-w-2xl mx-auto space-y-6 px-4 animate-doodle-fade-up">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 px-4 py-1.5 rounded-full">
            <Zap className="size-3 fill-primary text-primary" />
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Simple Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.05]">
            Invest in your
            <br />
            <span className="font-doodle italic doodle-underline text-primary">inner peace</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Two honest plans. No hidden fees. No first-month discounts. Just the same fair price, always.
          </p>
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex justify-center px-4">
          <div className="flex bg-muted/50 border border-border/50 p-1 rounded-full gap-1">
            {(["standard", "specialized"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
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
          ) : activeTab === "standard" ? (
            <>
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
              <p className="text-center text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/60">Group Live</span> — perfect for getting started with live classes.{" "}
                <span className="font-semibold text-foreground/60">Private 1:1</span> — personalised sessions starting at {centsToDisplay(calcPrivatePrice(MIN_SESSIONS))}/mo.
              </p>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <SpecializedPricingCard
                  planName="prenatal_postnatal"
                  config={specializedPlanConfig.prenatal_postnatal}
                  sessionCount={prenatalSessions}
                  onSessionCountChange={setPrenatalSessions}
                  isAuthenticated={isAuthenticated}
                  isPending={isPending}
                  onSubscribe={() => handleSpecializedSubscribe("prenatal_postnatal", prenatalSessions)}
                />
                <SpecializedPricingCard
                  planName="therapeutic_yoga"
                  config={specializedPlanConfig.therapeutic_yoga}
                  sessionCount={therapeuticSessions}
                  onSessionCountChange={setTherapeuticSessions}
                  isAuthenticated={isAuthenticated}
                  isPending={isPending}
                  onSubscribe={() => handleSpecializedSubscribe("therapeutic_yoga", therapeuticSessions)}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/60">Prenatal & Postnatal</span> — safe, supported yoga from bump to baby.{" "}
                <span className="font-semibold text-foreground/60">Therapeutic Yoga</span> — heal and restore with a specialist. Both start at {centsToDisplay(calcSpecializedPrice(MIN_SESSIONS))}/mo.
              </p>
            </>
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
            <div className="absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-sky-500/4 pointer-events-none" />
            <div className="absolute -top-20 -right-20 size-64 bg-primary/6 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 size-64 bg-sky-500/6 blur-3xl rounded-full pointer-events-none" />

            <div className="relative space-y-6">
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
