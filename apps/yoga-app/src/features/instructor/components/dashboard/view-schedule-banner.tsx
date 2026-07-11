import { Link } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";

interface ViewScheduleBannerProps {
  upcomingCount: number;
}

export function ViewScheduleBanner({ upcomingCount }: ViewScheduleBannerProps) {
  return (
    <Link to="/instructor/dashboard/upcoming" className="block group h-full">
      <div className="h-full rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <CalendarRange className="size-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">Full schedule &amp; calendar</p>
            <p className="text-xs text-muted-foreground truncate">
              {upcomingCount > 0
                ? `${upcomingCount} upcoming session${upcomingCount === 1 ? "" : "s"}`
                : "Filter and view your sessions"}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors pr-1 shrink-0">
          Open →
        </span>
      </div>
    </Link>
  );
}
