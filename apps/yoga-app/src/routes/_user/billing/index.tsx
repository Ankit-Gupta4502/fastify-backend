import { createFileRoute } from "@tanstack/react-router";
import type { PlanRecord } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPlan, usePlansWithPricing } from "@/features/payments/hooks/use-plans";
import { BillingHeader } from "@/features/payments/components/billing/billing-header";
import { PlanCard } from "@/features/payments/components/billing/plan-card";
import { PrivateSessionCard } from "@/features/payments/components/billing/private-session-card";

export const Route = createFileRoute("/_user/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const plans = usePlansWithPricing();
  const myPlan = useMyPlan();
  // A user can hold more than one active subscription at once (e.g. a group
  // plan plus a private-session add-on) — render a card per subscription.
  const activeSubs = myPlan.data?.data ?? [];
  const allPlans = plans.data?.data?.plans ?? [];
  const isIndia = plans.data?.data?.country === "IN";

  const isLoading = plans.isLoading || myPlan.isLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <BillingHeader />



      <div className="grid md:grid-cols-3 gap-8 items-start">
        {isLoading ? (
          <Skeleton className="h-112 rounded-4xl" />
        ) : activeSubs.length === 0 ? (
          <div className="md:col-span-3 text-center text-muted-foreground py-12">
            You don't have an active subscription yet.
          </div>
        ) : (
          activeSubs.map((sub) => {
            // Recurring plans (e.g. group_live) have no session cap; session-based
            // plans (private / prenatal_postnatal / therapeutic_yoga) do.
            if (sub.sessionsTotal === null) {
              const planRecord: PlanRecord | undefined = allPlans.find((p) => p.id === sub.plan.id);
              if (!planRecord) return null;
              return (
                <PlanCard
                  key={sub.subscriptionId}
                  plan={planRecord}
                  isActive
                  readOnly
                  isIndia={isIndia}
                  expiresAt={sub.expiresAt}
                  subscriptionId={sub.subscriptionId}
                />
              );
            }
            const planRecord = allPlans.find((p) => p.id === sub.plan.id);
            return (
              <PrivateSessionCard
                key={sub.subscriptionId}
                planName={sub.plan.name}
                sessionCount={sub.sessionsTotal}
                onSessionCountChange={() => {}}
                isActive
                activeSessions={sub.sessionsTotal}
                isPending={false}
                onSubscribe={() => {}}
                readOnly
                isIndia={isIndia}
                pricePerSessionCents={planRecord?.pricePerSessionCents ?? null}
                pricePerSessionInrPaise={planRecord?.pricePerSessionInrPaise ?? null}
                expiresAt={sub.expiresAt}
                subscriptionId={sub.subscriptionId}
              />
            );
          })
        )}
      </div>

    </div>
  );
}
