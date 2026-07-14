import { CalendarDays, Users, Video, ArrowRight } from "lucide-react";
import type { Workshop } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/shared/lib/timezone";
import { useWorkshopPricing } from "@/features/workshops/hooks/use-workshop-pricing";
import { Link } from "@tanstack/react-router";

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const tz = userTimezone();

  const spotsLeft = workshop.maxAttendees - workshop.attendeeCount;
  const full = spotsLeft <= 0;

  const { price, currency } = useWorkshopPricing(workshop);

  return (
    <Link
      to="/workshops/$workshopId"
      params={{ workshopId: workshop.id }}
      className="group relative flex flex-col rounded-3xl border border-border/60 bg-card overflow-hidden hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 flex-1 space-y-4">
        {workshop.scheduledAt && (
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary" />
            {formatCompact(workshop.scheduledAt, tz)}
          </div>
        )}

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">{workshop.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {workshop.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {full ? (
              <span className="text-destructive font-medium">Full</span>
            ) : (
              <span><span className="text-foreground font-semibold">{spotsLeft}</span> spots left</span>
            )}
          </span>
          {workshop.meetLink && (
            <span className="flex items-center gap-1.5">
              <Video className="size-3.5 text-primary" />
              Google Meet
            </span>
          )}
          {price != null && price > 0 ? (
            <span className="ml-auto font-bold text-foreground">
              {currency === "INR" ? "₹" : "$"}{(price / 100).toFixed(0)}
            </span>
          ) : (
            <span className="ml-auto font-bold text-emerald-600">Free</span>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        <span className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
          {full ? "View Workshop" : "View & Register"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
