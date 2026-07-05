import { createFileRoute } from "@tanstack/react-router";
import { Users, TrendingUp, UserCheck, Percent } from "lucide-react";
import type { PlanRecord } from "@yoga-app/shared";
import { calcCustomPriceCents } from "@yoga-app/shared";
import { useAdminUsers } from "@/features/admin/hooks/use-admin";
import { usePlansWithPricing } from "@/features/payments/hooks/use-plans";
import { SectionHeader } from "@/shared/components/misc/section-header";
import { StatCard } from "@/shared/components/misc/stat-card";
import { centsToDisplay } from "@/shared/lib/utils";
import { SubscriptionsCharts } from "@/features/admin/components/subscriptions-charts";
import { SubscribersTable } from "@/features/admin/components/subscribers-table";

export const Route = createFileRoute("/admin/subscriptions/")({
  component: AdminSubscriptionsPage,
});

function getPlanPriceCents(planName: string, plans: PlanRecord[]): number {
  if (planName.startsWith("custom_private_")) {
    const parts = planName.split("_");
    const sessions = parseInt(parts[parts.length - 1] ?? "4", 10);
    return calcCustomPriceCents(isNaN(sessions) ? 4 : sessions);
  }
  return plans?.find((p) => p.name === planName)?.priceCents ?? 0;
}

function AdminSubscriptionsPage() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: plansData } = usePlansWithPricing();

  const users = usersData?.data?.items ?? [];
  const plans = plansData?.data?.plans ?? [];

  const regularUsers = users.filter((u) => u.role === "user");
  const subscribers = regularUsers.filter((u) => u.planName !== null);
  const freeUsers = regularUsers.filter((u) => u.planName === null);

  const conversionRate =
    regularUsers.length > 0
      ? Math.round((subscribers.length / regularUsers.length) * 100)
      : 0;

  const mrrCents = subscribers.reduce(
    (sum, u) => sum + getPlanPriceCents(u.planName!, plans),
    0,
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Admin"
        title="Subscriptions"
        description="Track who purchased a plan and monitor revenue."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscribers"
          value={String(subscribers.length)}
          icon={UserCheck}
          accent="text-primary"
          bg="bg-primary/10"
          loading={usersLoading}
        />
        <StatCard
          label="Free Users"
          value={String(freeUsers.length)}
          icon={Users}
          accent="text-muted-foreground"
          bg="bg-muted"
          loading={usersLoading}
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Percent}
          accent="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/10"
          loading={usersLoading}
        />
        <StatCard
          label="Est. MRR"
          value={mrrCents ? centsToDisplay(mrrCents) : "—"}
          icon={TrendingUp}
          accent="text-amber-600 dark:text-amber-400"
          bg="bg-amber-500/10"
          loading={usersLoading}
        />
      </div>

      {!usersLoading && subscribers.length > 0 && (
        <SubscriptionsCharts users={users} plans={plans} />
      )}

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Subscriber List
          {!usersLoading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({subscribers.length})
            </span>
          )}
        </h2>
        <SubscribersTable users={users} plans={plans} isLoading={usersLoading} />
      </div>
    </div>
  );
}
