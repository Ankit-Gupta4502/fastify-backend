import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { AdminUserSubscription } from "@yoga-app/shared";

function statusBadge(status: string) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 className="size-3" />
        Active
      </span>
    );
  }
  if (status === "expired" || status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
        <XCircle className="size-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <Clock className="size-3" />
      {status.replace("_", " ")}
    </span>
  );
}

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
            {statusBadge(sub.status)}
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
                ₹{(sub.pricePaidCents / 100).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
