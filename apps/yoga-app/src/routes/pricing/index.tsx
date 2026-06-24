import { createFileRoute, Link } from "@tanstack/react-router";
import { PAGE_SEO } from "@/lib/seo";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

import { StarDoodle, CircleDoodle, PlusDoodle } from "@/components/shared/doodles";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePlansWithPricing, useMyPlan } from "@/hooks/use-plans";
import { useCheckout, useCustomCheckout } from "@/hooks/use-checkout";
import { PLAN_COPY } from "@/lib/plan-copy";
import type { PlanRecord } from "@yoga-app/shared";

import { MIN_SESSIONS, specializedPlanConfig } from "./-components/pricing-config";
import { PricingHero } from "./-components/PricingHero";
import { PricingFeedback } from "./-components/PricingFeedback";
import { PlansGrid } from "./-components/PlansGrid";
import { PricingFAQ } from "./-components/PricingFAQ";
import { TrustSection } from "./-components/TrustSection";

export const Route = createFileRoute("/pricing/")({
  head: () => PAGE_SEO.pricing,
  component: PricingPage,
});

function PricingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const plans = usePlansWithPricing();
  const myPlan = useMyPlan(isAuthenticated);
  const checkout = useCheckout();
  const customCheckout = useCustomCheckout();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(MIN_SESSIONS);
  const [prenatalSessions, setPrenatalSessions] = useState(MIN_SESSIONS);
  const [therapeuticSessions, setTherapeuticSessions] = useState(MIN_SESSIONS);

  const allPlans = plans.data?.data ?? [];
  const groupPlan = allPlans.find((p) => p.name === "group_live") ?? null;
  const privatePlan = allPlans.find((p) => p.name === "private") ?? null;
  const prenatalPlan = allPlans.find((p) => p.name === "prenatal_postnatal") ?? null;
  const therapeuticPlan = allPlans.find((p) => p.name === "therapeutic_yoga") ?? null;

  const activeSub = myPlan.data?.data ?? null;
  const activePlan = activeSub?.plan ?? null;
  const activePlanName = activePlan?.name ?? null;
  const activeSessions = activeSub?.sessionsTotal ?? null;
  const isGroupPlanActive = !!groupPlan && activePlan?.id === groupPlan.id;
  const isPrivatePlanActive = activePlanName === "private";
  const isPrenatalPlanActive = activePlanName === "prenatal_postnatal";
  const isTherapeuticPlanActive = activePlanName === "therapeutic_yoga";

  useEffect(() => {
    if (!activeSessions) return;
    if (isPrivatePlanActive) setSessionCount(activeSessions);
    if (isPrenatalPlanActive) setPrenatalSessions(activeSessions);
    if (isTherapeuticPlanActive) setTherapeuticSessions(activeSessions);
  }, [activeSessions, isPrivatePlanActive, isPrenatalPlanActive, isTherapeuticPlanActive]);

  const handleGroupSubscribe = (plan: PlanRecord) => {
    setError(null);
    setSuccess(null);
    setPendingCard("group");
    checkout.mutate(plan.id, {
      onSuccess: () => { setPendingCard(null); setSuccess(`You're now on ${PLAN_COPY[plan.name]?.title ?? plan.name}!`); },
      onError: (err) => { setPendingCard(null); setError(err instanceof Error ? err.message : "Payment failed"); },
    });
  };

  const handleSpecializedSubscribe = (planName: "private" | "prenatal_postnatal" | "therapeutic_yoga", sessions: number) => {
    setError(null);
    setSuccess(null);
    setPendingCard(planName);
    const title = specializedPlanConfig[planName]?.title ?? planName;
    customCheckout.mutate({ sessionCount: sessions, planName }, {
      onSuccess: () => { setPendingCard(null); setSuccess(`${title} activated — ${sessions} sessions/mo`); },
      onError: (err) => { setPendingCard(null); setError(err instanceof Error ? err.message : "Payment failed"); },
    });
  };

  const handlePrivateSubscribe = () => {
    setError(null);
    setSuccess(null);
    setPendingCard("private");
    customCheckout.mutate({ sessionCount, planName: "private" }, {
      onSuccess: () => { setPendingCard(null); setSuccess(`Private plan activated — ${sessionCount} sessions/mo`); },
      onError: (err) => { setPendingCard(null); setError(err instanceof Error ? err.message : "Payment failed"); },
    });
  };

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-175 bg-primary/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 size-112.5 bg-sky-500/4 blur-[110px] rounded-full" />
        <div className="absolute top-1/2 left-0 size-75 bg-accent/4 blur-[90px] rounded-full" />
      </div>

      {/* Floating doodles */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <StarDoodle className="absolute top-20 right-[8%] size-7 text-primary/20 animate-doodle-float" />
        <CircleDoodle className="absolute top-10 left-[4%] size-32 text-primary/7 animate-doodle-spin-slow" />
        <PlusDoodle className="absolute top-[40%] right-[3%] size-5 text-primary/15 animate-doodle-float-alt" style={{ animationDelay: "1.5s" }} />
        <StarDoodle className="absolute top-[55%] left-[6%] size-4 text-accent/30 animate-doodle-float" style={{ animationDelay: "2s" }} />
        <CircleDoodle className="absolute bottom-[20%] right-[5%] size-44 text-accent/6 animate-doodle-spin-rev" />
        <StarDoodle className="absolute top-[25%] left-[12%] size-2.5 text-primary/25 animate-doodle-float-alt" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="py-10 md:py-16 space-y-16">
        <PricingHero />

        <PricingFeedback error={error} success={success} />

        <PlansGrid
          isLoading={authLoading || plans.isLoading}
          isAuthenticated={isAuthenticated}
          groupPlan={groupPlan}
          privatePlan={privatePlan}
          prenatalPlan={prenatalPlan}
          therapeuticPlan={therapeuticPlan}
          pendingCard={pendingCard}
          isGroupPlanActive={isGroupPlanActive}
          isPrivatePlanActive={isPrivatePlanActive}
          isPrenatalPlanActive={isPrenatalPlanActive}
          isTherapeuticPlanActive={isTherapeuticPlanActive}
          activeSessions={activeSessions}
          sessionCount={sessionCount}
          prenatalSessions={prenatalSessions}
          therapeuticSessions={therapeuticSessions}
          onSessionCountChange={setSessionCount}
          onPrenatalSessionsChange={setPrenatalSessions}
          onTherapeuticSessionsChange={setTherapeuticSessions}
          onGroupSubscribe={handleGroupSubscribe}
          onPrivateSubscribe={handlePrivateSubscribe}
          onSpecializedSubscribe={handleSpecializedSubscribe}
        />

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

        <PricingFAQ />
        <TrustSection />
      </div>
    </div>
  );
}
