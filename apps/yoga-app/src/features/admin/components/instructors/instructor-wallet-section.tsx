import { TrendingUp } from "lucide-react";
import type { WalletBalance } from "@yoga-app/shared";

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(paise / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InstructorWalletSection({ wallet }: { wallet: WalletBalance }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-emerald-500/10 px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Total earnings
        </span>
        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatInr(wallet.balancePaise)}
        </span>
      </div>

      {wallet.transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No earnings yet.</p>
      ) : (
        <div>
          {wallet.transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">
                    {tx.description ?? "Session completed"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(tx.createdAt)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatInr(tx.amountPaise)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
