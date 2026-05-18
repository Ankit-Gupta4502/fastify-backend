import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { PlanRecord } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPlan, usePlansWithPricing } from "@/hooks/use-plans";
import { useCheckout } from "@/hooks/use-checkout";
import { BillingHeader } from "./_components/billing/billing-header";
import { CurrentPlanBanner } from "./_components/billing/current-plan-banner";
import { FeedbackBanner } from "./_components/billing/feedback-banner";
import { PlanCard } from "./_components/billing/plan-card";
import { SecureFooter } from "./_components/billing/secure-footer";

export const Route = createFileRoute("/_user/billing")({
  component: BillingPage,
});

function BillingPage() {
  const plans = usePlansWithPricing();
  const myPlan = useMyPlan();
  const checkout = useCheckout();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const planList: PlanRecord[] = plans.data?.data ?? [];
  const activePlanId = myPlan.data?.data?.plan?.id ?? null;

  const handleSubscribe = (plan: PlanRecord) => {
    setError(null);
    setSuccess(null);
    checkout.mutate(plan.id, {
      onSuccess: () => setSuccess(`Welcome to ${plan.name.replace("_", " ")}!`),
      onError: (err) => setError(err instanceof Error ? err.message : "Payment failed"),
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <BillingHeader />

      <CurrentPlanBanner
        isLoading={myPlan.isLoading}
        planName={myPlan.data?.data?.plan?.name}
      />

      <FeedbackBanner error={error} success={success} />

      <div className="grid md:grid-cols-3 gap-8">
        {plans.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-112 rounded-4xl" />
            ))
          : planList.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={activePlanId === plan.id}
                isPending={checkout.isPending}
                onSubscribe={handleSubscribe}
              />
            ))}
      </div>

      <SecureFooter />
    </div>
  );
}
