import { CalendarDays, Radio } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useWorkshops } from "@/features/workshops/hooks/use-workshops";
import { formatCompact, userTimezone } from "@/shared/lib/timezone";

export function WorkshopChips() {
  const { data, isLoading } = useWorkshops();
  const workshops = data?.data ?? [];
  const tz = userTimezone();

  if (isLoading) {
    return (
      <div className="border-b border-border/40 bg-secondary/30 py-2.5 px-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 rounded bg-muted animate-pulse shrink-0" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 w-36 rounded-full bg-muted animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (workshops.length === 0) return null;

  return (
    <div className="border-b border-border/40 bg-secondary/30 py-2.5 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          {/* Label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Radio className="size-3 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Live Soon
            </span>
            <span className="h-3 w-px bg-border mx-1" />
          </div>

          {/* Chips */}
          {workshops.map((w) => (
            <Link
              key={w.id}
              to="/workshops/$workshopId"
              params={{ workshopId: w.id }}
              className="flex items-center gap-1.5 shrink-0 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <span className="max-w-[160px] truncate">{w.name}</span>
              {w.scheduledAt && (
                <>
                  <span className="h-2.5 w-px bg-border/60" />
                  <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                    <CalendarDays className="size-3 text-primary" />
                    {formatCompact(w.scheduledAt, tz)}
                  </span>
                </>
              )}
              {(!w.priceInr || w.priceInr === 0) && (!w.priceUsd || w.priceUsd === 0) && (
                <span className="ml-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  FREE
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
