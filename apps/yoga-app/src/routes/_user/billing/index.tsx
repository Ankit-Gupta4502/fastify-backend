import { createFileRoute } from "@tanstack/react-router";
import type { PlanRecord } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPlan, usePlansWithPricing } from "@/hooks/use-plans";
import { BillingHeader } from "../-components/billing/billing-header";
import { CurrentPlanBanner } from "../-components/billing/current-plan-banner";
import { PlanCard } from "../-components/billing/plan-card";
import { PrivateSessionCard } from "../-components/billing/private-session-card";
import { SecureFooter } from "../-components/billing/secure-footer";

export const Route = createFileRoute("/_user/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const plans = usePlansWithPricing();
  const myPlan = useMyPlan();

  const activePlan = myPlan.data?.data?.plan ?? null;
  const activePlanId = activePlan?.id ?? null;
  const activeSessions = activePlan?.sessionsPerMonth ?? null;
  const isPrivateActive = activePlan?.name?.startsWith("custom_private_") ?? false;

  const activePlanRecord: PlanRecord | undefined = (plans.data?.data ?? []).find(
    (p) => p.id === activePlanId && p.category === "standard" && !p.name.startsWith("custom_"),
  );

  const isLoading = plans.isLoading || myPlan.isLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <BillingHeader />

      <CurrentPlanBanner
        isLoading={myPlan.isLoading}
        planName={activePlan?.name}
      />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {isLoading ? (
          <Skeleton className="h-112 rounded-4xl" />
        ) : activePlanRecord ? (
          <PlanCard
            plan={activePlanRecord}
            isActive
            readOnly
          />
        ) : isPrivateActive ? (
          <PrivateSessionCard
            sessionCount={activeSessions ?? 4}
            onSessionCountChange={() => {}}
            isActive
            activeSessions={activeSessions}
            isPending={false}
            onSubscribe={() => {}}
            readOnly
          />
        ) : (
          <div className="md:col-span-3 text-center text-muted-foreground py-12">
            You don't have an active subscription yet.
          </div>
        )}
      </div>

      <SecureFooter />
    </div>
  );
}
