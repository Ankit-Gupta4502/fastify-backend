import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type { PlanRecord } from "@yoga-app/shared";
import { usePlanPrice } from "@/features/payments/hooks/use-plan-price";

import {
  MIN_SESSIONS,
  PRICE_DISCOUNT_CENTS,
  PRICE_DISCOUNT_INR_PAISE,
  specializedPlanConfig,
} from "./pricing-config";
import { PricingCard } from "@/features/payments/components/pricing/pricing-card";
import { PrivatePricingCard } from "@/features/payments/components/pricing/private-pricing-card";
import { SpecializedPricingCard } from "@/features/payments/components/pricing/specialized-pricing-card";

export type SpecializedPlanName = "prenatal_postnatal" | "therapeutic_yoga";

export interface SpecializedPlanEntry {
  planName: SpecializedPlanName;
  plan: PlanRecord | null;
  sessionCount: number;
  activeSessions: number | null;
  isActive: boolean;
  onSessionCountChange: (n: number) => void;
}

interface PlansGridProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  isIndia: boolean;
  pendingCard: string | null;

  groupPlan: PlanRecord | null;
  isGroupPlanActive: boolean;
  onGroupSubscribe: (plan: PlanRecord) => void;

  privatePlan: PlanRecord | null;
  privateSessionCount: number;
  privateActiveSessions: number | null;
  isPrivatePlanActive: boolean;
  onPrivateSessionCountChange: (n: number) => void;
  onPrivateSubscribe: () => void;

  specializedPlans: SpecializedPlanEntry[];
  onSpecializedSubscribe: (planName: SpecializedPlanName, sessions: number) => void;
}

export function PlansGrid({
  isLoading,
  isAuthenticated,
  isIndia,
  pendingCard,
  groupPlan,
  isGroupPlanActive,
  onGroupSubscribe,
  privatePlan,
  privateSessionCount,
  privateActiveSessions,
  isPrivatePlanActive,
  onPrivateSessionCountChange,
  onPrivateSubscribe,
  specializedPlans,
  onSpecializedSubscribe,
}: PlansGridProps) {
  const { display: privateFromPrice } = usePlanPrice({
    isIndia,
    priceCents: privatePlan?.pricePerSessionCents,
    priceInrPaise: privatePlan?.pricePerSessionInrPaise,
    quantity: MIN_SESSIONS,
    discountCents: PRICE_DISCOUNT_CENTS,
    discountInrPaise: PRICE_DISCOUNT_INR_PAISE,
  });
  const therapeuticEntry = specializedPlans.find((entry) => entry.planName === "therapeutic_yoga") ?? null;
  const { display: therapeuticFromPrice } = usePlanPrice({
    isIndia,
    priceCents: therapeuticEntry?.plan?.pricePerSessionCents,
    priceInrPaise: therapeuticEntry?.plan?.pricePerSessionInrPaise,
    quantity: MIN_SESSIONS,
  });

  return (
    <div className="px-4 space-y-6">
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-135 rounded-4xl" />
          ))}
        </div>
      ) : (
        <div className={cn("grid gap-8 items-start md:grid-cols-3")}>
          <PrivatePricingCard
            sessionCount={privateSessionCount}
            onSessionCountChange={onPrivateSessionCountChange}
            pricePerSessionCents={privatePlan?.pricePerSessionCents ?? null}
            pricePerSessionInrPaise={privatePlan?.pricePerSessionInrPaise ?? null}
            isAuthenticated={isAuthenticated}
            isPending={pendingCard === "private"}
            isActive={isPrivatePlanActive}
            isIndia={isIndia}
            activeSessions={privateActiveSessions}
            onSubscribe={onPrivateSubscribe}
          />
          {groupPlan && (
            <PricingCard
              plan={groupPlan}
              isAuthenticated={isAuthenticated}
              isPending={pendingCard === "group"}
              isActive={isGroupPlanActive}
              isIndia={isIndia}
              onSubscribe={onGroupSubscribe}
            />
          )}
          {specializedPlans.map((entry) => (
            <SpecializedPricingCard
              key={entry.planName}
              planName={entry.planName}
              config={specializedPlanConfig[entry.planName]}
              sessionCount={entry.sessionCount}
              onSessionCountChange={entry.onSessionCountChange}
              pricePerSessionCents={entry.plan?.pricePerSessionCents ?? null}
              pricePerSessionInrPaise={entry.plan?.pricePerSessionInrPaise ?? null}
              isAuthenticated={isAuthenticated}
              isPending={pendingCard === entry.planName}
              isActive={entry.isActive}
              isIndia={isIndia}
              activeSessions={entry.activeSessions}
              onSubscribe={() => onSpecializedSubscribe(entry.planName, entry.sessionCount)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <span className="font-semibold text-foreground/60">Private 1:1</span> — from {privateFromPrice}/mo.{" "}
        <span className="font-semibold text-foreground/60">Prenatal & Postnatal</span> and{" "}
        <span className="font-semibold text-foreground/60">Therapeutic Yoga</span> — from {therapeuticFromPrice}/mo.
      </p>
    </div>
  );
}
