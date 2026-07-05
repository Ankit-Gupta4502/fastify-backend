import { Link } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";

interface ViewScheduleBannerProps {
  upcomingCount: number;
}

export function ViewScheduleBanner({ upcomingCount }: ViewScheduleBannerProps) {
  return (
    <Link to="/instructor/dashboard/upcoming" className="block group">
      <div className="rounded-3xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <CalendarRange className="size-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">Full schedule &amp; calendar</p>
            <p className="text-xs text-muted-foreground">
              {upcomingCount > 0
                ? `${upcomingCount} upcoming session${upcomingCount === 1 ? "" : "s"} — filter, search, and view by date`
                : "Search, filter, and view your sessions on a calendar"}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors pr-1">
          Open →
        </span>
      </div>
    </Link>
  );
}
