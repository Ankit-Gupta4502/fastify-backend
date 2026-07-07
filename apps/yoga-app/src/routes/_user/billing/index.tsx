import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMyPlan } from "@/features/payments/hooks/use-plans";
import { CancelSubscriptionCard } from "@/features/payments/components/billing";

export const Route = createFileRoute("/_user/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const { isAuthenticated } = useAuth();
  const myPlan = useMyPlan(isAuthenticated);

  const activeSubs = myPlan.data?.data ?? [];

  return (
    <div className="relative">
      <div className="py-10 md:py-16 space-y-16">
        {activeSubs.length > 0 && (
          <div className="px-4 max-w-2xl mx-auto w-full space-y-4">
            {activeSubs.map((sub) => (
              <CancelSubscriptionCard
                key={sub.subscriptionId}
                subscriptionId={sub.subscriptionId}
                planName={sub.plan.name}
                expiresAt={sub.expiresAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
