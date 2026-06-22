import { Skeleton } from "@/components/ui/skeleton";
import { cn, centsToDisplay } from "@/lib/utils";
import type { PlanRecord } from "@yoga-app/shared";

import {
  MIN_SESSIONS,
  specializedPlanConfig,
  calcPrivatePrice,
  calcSpecializedPrice,
} from "./pricing-config";
import { PricingCard } from "./PricingCard";
import { PrivatePricingCard } from "./PrivatePricingCard";
import { SpecializedPricingCard } from "./SpecializedPricingCard";

interface PlansGridProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  groupPlan: PlanRecord | null;
  privatePlan: PlanRecord | null;
  prenatalPlan: PlanRecord | null;
  therapeuticPlan: PlanRecord | null;
  pendingCard: string | null;
  isGroupPlanActive: boolean;
  isPrivatePlanActive: boolean;
  isPrenatalPlanActive: boolean;
  isTherapeuticPlanActive: boolean;
  activeSessions: number | null;
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
  groupPlan,
  privatePlan,
  prenatalPlan,
  therapeuticPlan,
  pendingCard,
  isGroupPlanActive,
  isPrivatePlanActive,
  isPrenatalPlanActive,
  isTherapeuticPlanActive,
  activeSessions,
  sessionCount,
  prenatalSessions,
  therapeuticSessions,
  onSessionCountChange,
  onPrenatalSessionsChange,
  onTherapeuticSessionsChange,
  onGroupSubscribe,
  onPrivateSubscribe,
  onSpecializedSubscribe,
}: PlansGridProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6">
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-135 rounded-4xl" />
          ))}
        </div>
      ) : (
        <div className={cn(
          "grid gap-8 items-start md:grid-cols-2",
          !groupPlan && "[&>*:last-child]:col-span-2 [&>*:last-child]:mx-auto [&>*:last-child]:w-[calc(50%-1rem)]",
        )}>
          {groupPlan && (
            <PricingCard
              plan={groupPlan}
              isAuthenticated={isAuthenticated}
              isPending={pendingCard === "group"}
              isActive={isGroupPlanActive}
              onSubscribe={onGroupSubscribe}
            />
          )}
          <PrivatePricingCard
            sessionCount={sessionCount}
            onSessionCountChange={onSessionCountChange}
            pricePerSessionCents={privatePlan?.pricePerSessionCents ?? null}
            isAuthenticated={isAuthenticated}
            isPending={pendingCard === "private"}
            isActive={isPrivatePlanActive}
            activeSessions={isPrivatePlanActive ? activeSessions : null}
            onSubscribe={onPrivateSubscribe}
          />
          <SpecializedPricingCard
            planName="prenatal_postnatal"
            config={specializedPlanConfig.prenatal_postnatal}
            sessionCount={prenatalSessions}
            onSessionCountChange={onPrenatalSessionsChange}
            pricePerSessionCents={prenatalPlan?.pricePerSessionCents ?? null}
            isAuthenticated={isAuthenticated}
            isPending={pendingCard === "prenatal_postnatal"}
            isActive={isPrenatalPlanActive}
            activeSessions={isPrenatalPlanActive ? activeSessions : null}
            onSubscribe={() => onSpecializedSubscribe("prenatal_postnatal", prenatalSessions)}
          />
          <SpecializedPricingCard
            planName="therapeutic_yoga"
            config={specializedPlanConfig.therapeutic_yoga}
            sessionCount={therapeuticSessions}
            onSessionCountChange={onTherapeuticSessionsChange}
            pricePerSessionCents={therapeuticPlan?.pricePerSessionCents ?? null}
            isAuthenticated={isAuthenticated}
            isPending={pendingCard === "therapeutic_yoga"}
            isActive={isTherapeuticPlanActive}
            activeSessions={isTherapeuticPlanActive ? activeSessions : null}
            onSubscribe={() => onSpecializedSubscribe("therapeutic_yoga", therapeuticSessions)}
          />
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <span className="font-semibold text-foreground/60">Group Live</span> — live classes for everyone.{" "}
        <span className="font-semibold text-foreground/60">Private 1:1</span> — from {centsToDisplay(calcPrivatePrice(MIN_SESSIONS))}/mo.{" "}
        <span className="font-semibold text-foreground/60">Prenatal & Postnatal</span> and{" "}
        <span className="font-semibold text-foreground/60">Therapeutic Yoga</span> — from {centsToDisplay(calcSpecializedPrice(MIN_SESSIONS))}/mo.
      </p>
    </div>
  );
}
