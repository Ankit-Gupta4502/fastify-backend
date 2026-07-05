import { Link } from "@tanstack/react-router";
import { IndianRupee } from "lucide-react";

interface EarningsBannerProps {
  balanceInr: number;
  isLoading: boolean;
}

export function EarningsBanner({ balanceInr, isLoading }: EarningsBannerProps) {
  return (
    <Link to="/instructor/earnings" className="block group">
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <IndianRupee className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Earnings
            </p>
            {isLoading ? (
              <div className="h-7 w-20 bg-muted/60 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{balanceInr.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors pr-1">
          View history →
        </span>
      </div>
    </Link>
  );
}
