import type { AdminUser, PlanRecord } from "@yoga-app/shared";
import { calcCustomPriceCents } from "@yoga-app/shared";
import { Chip } from "@/shared/components/misc/chip";
import { TableSkeletonRows } from "@/shared/components/misc/table-skeleton-rows";
import { PLAN_COPY } from "@/features/payments/utils/plan-copy";
import { centsToDisplay } from "@/shared/lib/utils";
import { SubscriptionStatusChip } from "@/features/admin/components/subscription-status-chip";

function getPlanLabel(planName: string): string {
  if (planName.startsWith("custom_private_")) {
    const parts = planName.split("_");
    const sessions = parts[parts.length - 1];
    return `Private 1:1 · ${sessions} sessions/mo`;
  }
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

interface SubscribersTableProps {
  users: AdminUser[];
  plans: PlanRecord[];
  isLoading: boolean;
}

export function SubscribersTable({ users, plans, isLoading }: SubscribersTableProps) {
  const subscribers = users.filter((u) => u.planName !== null && u.role === "user");

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Name
            </th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Email
            </th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Plan
            </th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Price / mo
            </th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading ? (
            <TableSkeletonRows rows={5} cols={6} />
          ) : (
            subscribers.map((u) => {
              const priceCents = getPlanPriceCents(u.planName!, plans);
              return (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Chip variant="primary" size="sm">
                      {getPlanLabel(u.planName!)}
                    </Chip>
                  </td>
                  <td className="px-4 py-3">
                    {u.status && <SubscriptionStatusChip status={u.status} />}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {priceCents ? centsToDisplay(priceCents) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {!isLoading && subscribers.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">No subscribers yet.</p>
      )}
    </div>
  );
}
