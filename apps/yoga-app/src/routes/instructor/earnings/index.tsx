import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, IndianRupee, TrendingUp } from "lucide-react";
import { useInstructorWallet } from "@/features/instructor/hooks/use-instructors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { WalletTransaction } from "@yoga-app/shared";

export const Route = createFileRoute("/instructor/earnings/")({
  component: EarningsPage,
});

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

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="size-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-medium leading-tight">
            {tx.description ?? "Session completed"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatDate(tx.createdAt)}
          </p>
        </div>
      </div>
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-sm px-3 py-1">
        +{formatInr(tx.amountPaise)}
      </Badge>
    </div>
  );
}

function EarningsPage() {
  const wallet = useInstructorWallet();
  const data = wallet.data?.data;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <Link
          to="/instructor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
          Wallet
        </p>
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Your Earnings
        </h1>
      </div>

      {/* Balance card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <IndianRupee className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Earnings
            </p>
            {wallet.isLoading ? (
              <Skeleton className="h-10 w-32 mt-1" />
            ) : (
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatInr(data?.balancePaise ?? 0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              ₹400 credited after each completed session
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card className="border-none shadow-sm bg-card/50 rounded-3xl">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-base font-semibold">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {wallet.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !data?.transactions.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <IndianRupee className="size-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No earnings yet.</p>
              <p className="text-xs mt-1">
                Complete your first session to see earnings here.
              </p>
            </div>
          ) : (
            <div>
              {data.transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
