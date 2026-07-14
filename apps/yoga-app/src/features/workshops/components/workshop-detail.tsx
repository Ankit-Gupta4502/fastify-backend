import { CalendarDays, Users, Video } from "lucide-react";
import type { Workshop } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/shared/lib/timezone";
import { useWorkshopPricing } from "@/features/workshops/hooks/use-workshop-pricing";
import { WorkshopRegisterCta } from "@/features/workshops/components/workshop-register-cta";

export function WorkshopDetail({ workshop }: { workshop: Workshop }) {
  const tz = userTimezone();
  const spotsLeft = workshop.maxAttendees - workshop.attendeeCount;
  const full = spotsLeft <= 0;

  const { displayPriceInr, displayPriceUsd } = useWorkshopPricing(workshop);

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto space-y-8">
      {workshop.image && (
        <div className="rounded-3xl overflow-hidden border border-border/60">
          <img src={workshop.image} alt={workshop.name} className="w-full h-56 sm:h-72 object-cover" />
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">{workshop.name}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {workshop.scheduledAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" />
              {formatCompact(workshop.scheduledAt, tz)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {full ? (
              <span className="text-destructive font-medium">Full</span>
            ) : (
              <span>
                <span className="font-semibold text-foreground">{spotsLeft}</span> spots left
              </span>
            )}
          </span>
          {workshop.meetLink && (
            <span className="flex items-center gap-1.5">
              <Video className="size-4 text-primary" />
              Google Meet
            </span>
          )}
          {displayPriceInr != null && displayPriceInr > 0 ? (
            <span className="font-bold text-foreground">₹{(displayPriceInr / 100).toFixed(0)}</span>
          ) : displayPriceUsd != null && displayPriceUsd > 0 ? (
            <span className="font-bold text-foreground">${(displayPriceUsd / 100).toFixed(0)}</span>
          ) : (
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold px-2.5 py-1">
              FREE
            </span>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card px-6 py-5">
        <WorkshopRegisterCta workshop={workshop} />
      </div>

      <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base">
        {workshop.content ?? workshop.description}
      </div>
    </div>
  );
}
