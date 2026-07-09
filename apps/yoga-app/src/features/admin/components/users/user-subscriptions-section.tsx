import type { AdminUserSubscription } from "@yoga-app/shared";
import { SubscriptionStatusChip } from "@/shared/components/misc/subscription-status-chip";
import { paidAmountToDisplay } from "@/shared/lib/utils";

export function UserSubscriptionsSection({ subscriptions }: { subscriptions: AdminUserSubscription[] }) {
  if (subscriptions.length === 0) {
    return <p className="text-sm text-muted-foreground">No subscriptions found.</p>;
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm capitalize">{sub.planName.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Purchased {new Date(sub.purchasedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
                {sub.expiresAt && (
                  <> · Expires {new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}</>
                )}
              </p>
            </div>
            <SubscriptionStatusChip status={sub.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {sub.sessionsTotal !== null && (
              <div className="rounded-lg bg-secondary/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Sessions used</p>
                <p className="text-sm font-semibold mt-0.5">
                  {sub.sessionsUsed} / {sub.sessionsTotal}
                </p>
                <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, (sub.sessionsUsed / sub.sessionsTotal) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="rounded-lg bg-secondary/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-sm font-semibold mt-0.5">
                {paidAmountToDisplay(sub.pricePaidCents, sub.currency)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
