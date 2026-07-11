import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AdminUser, PlanRecord } from "@yoga-app/shared";
import { calcCustomPriceCents } from "@yoga-app/shared";
import { PLAN_COPY } from "@/features/payments/utils/plan-copy";
import { centsToDisplay } from "@/shared/lib/utils";

function getPlanLabel(planName: string): string {
  if (planName.startsWith("custom_private_")) return "Private 1:1";
  return PLAN_COPY[planName]?.title ?? planName.replace(/_/g, " ");
}

function getPlanPriceCents(planName: string, plans: PlanRecord[]): number {
  if (planName.startsWith("custom_private_")) {
    const parts = planName.split("_");
    const sessions = parseInt(parts[parts.length - 1] ?? "4", 10);
    return calcCustomPriceCents(isNaN(sessions) ? 4 : sessions);
  }
  return plans.find((p) => p.name === planName)?.priceCents ?? 0;
}

const distributionConfig = {
  count: { label: "Subscribers", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const revenueConfig = {
  mrr: { label: "Est. MRR", color: "hsl(var(--chart-2, var(--primary)))" },
} satisfies ChartConfig;

interface SubscriptionsChartsProps {
  users: AdminUser[];
  plans: PlanRecord[];
}

export function SubscriptionsCharts({ users, plans }: SubscriptionsChartsProps) {
  const subscribers = users.filter((u) => u.planName !== null);

  const planMap = new Map<string, { count: number; totalCents: number }>();
  for (const user of subscribers) {
    const label = getPlanLabel(user.planName!);
    const price = getPlanPriceCents(user.planName!, plans);
    const prev = planMap.get(label) ?? { count: 0, totalCents: 0 };
    planMap.set(label, { count: prev.count + 1, totalCents: prev.totalCents + price });
  }

  const distributionData = Array.from(planMap.entries()).map(([plan, { count }]) => ({
    plan,
    count,
  }));

  const revenueData = Array.from(planMap.entries()).map(([plan, { totalCents }]) => ({
    plan,
    mrr: Math.round(totalCents / 100),
    mrrLabel: centsToDisplay(totalCents),
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm bg-card/50 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Plan Distribution</CardTitle>
          <CardDescription>Active subscribers by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={distributionConfig} className="h-64">
            <BarChart data={distributionData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="plan" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card/50 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Revenue by Plan</CardTitle>
          <CardDescription>Estimated monthly recurring revenue per plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-64">
            <BarChart data={revenueData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="plan" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(_value, _name, item) => (
                      <span>{item.payload.mrrLabel}</span>
                    )}
                  />
                }
              />
              <Bar dataKey="mrr" fill="var(--color-mrr)" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
