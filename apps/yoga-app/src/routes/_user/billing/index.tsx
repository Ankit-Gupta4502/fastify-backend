import { createFileRoute,  useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePlansWithPricing, useMyPlan } from "@/features/payments/hooks/use-plans";
import { useCheckout, useCustomCheckout } from "@/features/payments/hooks/use-checkout";
import { PLAN_COPY } from "@/features/payments/utils/plan-copy";
import type { PlanRecord } from "@yoga-app/shared";

import { MIN_SESSIONS, specializedPlanConfig } from "@/features/payments/components/pricing/pricing-config";
import { PricingFeedback } from "@/features/payments/components/pricing/pricing-feedback";
import { PlansGrid } from "@/features/payments/components/pricing/plans-grid";

export const Route = createFileRoute("/_user/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const plans = usePlansWithPricing();
  const myPlan = useMyPlan(isAuthenticated);
  const isIndia = plans.data?.data?.country === "IN";
  const checkout = useCheckout();
  const customCheckout = useCustomCheckout();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingCard, setPendingCard] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(MIN_SESSIONS);
  const [prenatalSessions, setPrenatalSessions] = useState(MIN_SESSIONS);
  const [therapeuticSessions, setTherapeuticSessions] = useState(MIN_SESSIONS);

  const allPlans = plans.data?.data?.plans ?? [];
  const groupPlan = allPlans.find((p) => p.name === "group_live") ?? null;
  const privatePlan = allPlans.find((p) => p.name === "private") ?? null;
  const prenatalPlan = allPlans.find((p) => p.name === "prenatal_postnatal") ?? null;
  const therapeuticPlan = allPlans.find((p) => p.name === "therapeutic_yoga") ?? null;

  // A user can hold more than one active plan at once (e.g. a group plan plus
  // a private-session add-on), so each plan type is looked up independently.
  const activeSubs = myPlan.data?.data ?? [];
  const groupSub = groupPlan ? activeSubs.find((s) => s.plan.id === groupPlan.id) : undefined;
  const privateSub = activeSubs.find((s) => s.plan.name === "private");
  const prenatalSub = activeSubs.find((s) => s.plan.name === "prenatal_postnatal");
  const therapeuticSub = activeSubs.find((s) => s.plan.name === "therapeutic_yoga");

  const isGroupPlanActive = !!groupSub;
  const isPrivatePlanActive = !!privateSub;
  const isPrenatalPlanActive = !!prenatalSub;
  const isTherapeuticPlanActive = !!therapeuticSub;

  const privateActiveSessions = privateSub?.sessionsTotal ?? null;
  const prenatalActiveSessions = prenatalSub?.sessionsTotal ?? null;
  const therapeuticActiveSessions = therapeuticSub?.sessionsTotal ?? null;

  useEffect(() => {
    if (privateActiveSessions != null) setSessionCount(privateActiveSessions);
  }, [privateActiveSessions]);

  useEffect(() => {
    if (prenatalActiveSessions != null) setPrenatalSessions(prenatalActiveSessions);
  }, [prenatalActiveSessions]);

  useEffect(() => {
    if (therapeuticActiveSessions != null) setTherapeuticSessions(therapeuticActiveSessions);
  }, [therapeuticActiveSessions]);

  const country = plans.data?.data?.country ?? undefined;

  const handleGroupSubscribe = (plan: PlanRecord) => {
    setError(null);
    setSuccess(null);
    setPendingCard("group");
    checkout.mutate({ planId: plan.id, country }, {
      onSuccess: () => {
        setPendingCard(null);
        setSuccess(`You're now on ${PLAN_COPY[plan.name]?.title ?? plan.name}!`);
        router.navigate({ to: "/rooms" });
      },
      onError: (err) => { setPendingCard(null); setError(err instanceof Error ? err.message : "Payment failed"); },
    });
  };

  const handleSpecializedSubscribe = (planName: "private" | "prenatal_postnatal" | "therapeutic_yoga", sessions: number) => {
    setError(null);
    setSuccess(null);
    setPendingCard(planName);
    const title = specializedPlanConfig[planName]?.title ?? planName;
    customCheckout.mutate({ sessionCount: sessions, planName, country }, {
      onSuccess: () => {
        setPendingCard(null);
        setSuccess(`${title} activated — ${sessions} sessions/mo`);
        router.navigate({ to: "/private-sessions" });
      },
      onError: (err) => { setPendingCard(null); setError(err instanceof Error ? err.message : "Payment failed"); },
    });
  };

  const handlePrivateSubscribe = () => {
    setError(null);
    setSuccess(null);
    setPendingCard("private");
    customCheckout.mutate({ sessionCount, planName: "private", country }, {
      onSuccess: () => {
        setPendingCard(null);
        setSuccess(`Private plan activated — ${sessionCount} sessions/mo`);
        router.navigate({ to: "/private-sessions" });
      },
      onError: (err) => { setPendingCard(null); setError(err instanceof Error ? err.message : "Payment failed"); },
    });
  };

  return (
    <div className="relative">

      <div className="py-10 md:py-16 space-y-16">
        <PricingFeedback error={error} success={success} />
        <PlansGrid
          isLoading={authLoading || plans.isLoading}
          isAuthenticated={isAuthenticated}
          isIndia={isIndia}
          groupPlan={groupPlan}
          privatePlan={privatePlan}
          prenatalPlan={prenatalPlan}
          therapeuticPlan={therapeuticPlan}
          pendingCard={pendingCard}
          isGroupPlanActive={isGroupPlanActive}
          isPrivatePlanActive={isPrivatePlanActive}
          isPrenatalPlanActive={isPrenatalPlanActive}
          isTherapeuticPlanActive={isTherapeuticPlanActive}
          privateActiveSessions={privateActiveSessions}
          prenatalActiveSessions={prenatalActiveSessions}
          therapeuticActiveSessions={therapeuticActiveSessions}
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
      </div>
    </div>
  );
}
