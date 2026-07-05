import { Link } from "@tanstack/react-router";
import { IndianRupee } from "lucide-react";

interface EarningsBannerProps {
  balanceInr: number;
  isLoading: boolean;
}

export function EarningsBanner({ balanceInr, isLoading }: EarningsBannerProps) {
  return (
    <Link to="/instructor/earnings" className="block group h-full">
      <div className="h-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <IndianRupee className="size-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Earnings
            </p>
            {isLoading ? (
              <div className="h-6 w-16 bg-muted/60 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
                ₹{balanceInr.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors pr-1 shrink-0">
          View →
        </span>
      </div>
    </Link>
  );
}
