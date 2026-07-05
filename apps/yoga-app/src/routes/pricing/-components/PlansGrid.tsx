import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PlanRecord } from "@yoga-app/shared";
import { usePlanPrice } from "@/hooks/use-plan-price";

import {
  MIN_SESSIONS,
  PRICE_DISCOUNT_CENTS,
  PRICE_DISCOUNT_INR_PAISE,
  specializedPlanConfig,
} from "./pricing-config";
import { PricingCard } from "./PricingCard";
import { PrivatePricingCard } from "./PrivatePricingCard";
import { SpecializedPricingCard } from "./SpecializedPricingCard";

interface PlansGridProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  isIndia: boolean;
  groupPlan: PlanRecord | null;
  privatePlan: PlanRecord | null;
  prenatalPlan: PlanRecord | null;
  therapeuticPlan: PlanRecord | null;
  pendingCard: string | null;
  isGroupPlanActive: boolean;
  isPrivatePlanActive: boolean;
  isPrenatalPlanActive: boolean;
  isTherapeuticPlanActive: boolean;
  privateActiveSessions: number | null;
  prenatalActiveSessions: number | null;
  therapeuticActiveSessions: number | null;
  sessionCount: number;
  prenatalSessions: number;
  therapeuticSessions: number;
  onSessionCountChange: (n: number) => void;
  onPrenatalSessionsChange: (n: number) => void;
  onTherapeuticSessionsChange: (n: number) => void;
  onGroupSubscribe: (plan: PlanRecord) => void;
  onPrivateSubscribe: () => void;
  onSpecializedSubscribe: (planName: "private" | "prenatal_postnatal" | "therapeutic_yoga", sessions: number) => void;
}

export function PlansGrid({
  isLoading,
  isAuthenticated,
  isIndia,
  groupPlan,
  privatePlan,
  prenatalPlan: _prenatalPlan,
  therapeuticPlan,
  pendingCard,
  isGroupPlanActive,
  isPrivatePlanActive,
  isPrenatalPlanActive: _isPrenatalPlanActive,
  isTherapeuticPlanActive,
  privateActiveSessions,
  prenatalActiveSessions: _prenatalActiveSessions,
  therapeuticActiveSessions,
  sessionCount,
  prenatalSessions: _prenatalSessions,
  therapeuticSessions,
  onSessionCountChange,
  onPrenatalSessionsChange: _onPrenatalSessionsChange,
  onTherapeuticSessionsChange,
  onGroupSubscribe,
  onPrivateSubscribe,
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
  const { display: therapeuticFromPrice } = usePlanPrice({
    isIndia,
    priceCents: therapeuticPlan?.pricePerSessionCents,
    priceInrPaise: therapeuticPlan?.pricePerSessionInrPaise,
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
            sessionCount={sessionCount}
            onSessionCountChange={onSessionCountChange}
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
          {/* prenatal_postnatal hidden for now */}
          <SpecializedPricingCard
            planName="therapeutic_yoga"
            config={specializedPlanConfig.therapeutic_yoga}
            sessionCount={therapeuticSessions}
            onSessionCountChange={onTherapeuticSessionsChange}
            pricePerSessionCents={therapeuticPlan?.pricePerSessionCents ?? null}
            pricePerSessionInrPaise={therapeuticPlan?.pricePerSessionInrPaise ?? null}
            isAuthenticated={isAuthenticated}
            isPending={pendingCard === "therapeutic_yoga"}
            isActive={isTherapeuticPlanActive}
            isIndia={isIndia}
            activeSessions={therapeuticActiveSessions}
            onSubscribe={() => onSpecializedSubscribe("therapeutic_yoga", therapeuticSessions)}
          />
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
