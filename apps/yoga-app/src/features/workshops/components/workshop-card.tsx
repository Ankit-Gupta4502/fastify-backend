import { CalendarDays, Users, Video, ArrowRight, Loader2, CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Workshop } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/shared/lib/timezone";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getStoredUtm } from "@/shared/lib/utm";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWorkshopCheckout } from "@/features/workshops/hooks/use-workshops";

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const tz = userTimezone();
  const checkout = useWorkshopCheckout(workshop);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spotsLeft = workshop.maxAttendees - workshop.attendeeCount;
  const full = spotsLeft <= 0;

  const utm = getStoredUtm();
  const utmSource = utm?.utmSource ?? null;
  const isPaid = !!utmSource && (workshop.utmPriceInr > 0 || workshop.utmPriceUsd > 0);

  const displayPriceInr = utmSource ? workshop.utmPriceInr : workshop.priceInr;
  const displayPriceUsd = utmSource ? workshop.utmPriceUsd : workshop.priceUsd;

  const handleJoin = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    setError(null);
    checkout.mutate(undefined, {
      onSuccess: () => setDone(true),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Could not register";
        if (msg === "Payment cancelled") return;
        setError(msg);
      },
    });
  };

  return (
    <div className="group relative flex flex-col rounded-3xl border border-border/60 bg-card overflow-hidden hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 flex-1 space-y-4">
        {workshop.scheduledAt && (
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary" />
            {formatCompact(workshop.scheduledAt, tz)}
          </div>
        )}

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold leading-snug">{workshop.name}</h3>
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
          {displayPriceInr != null && displayPriceInr > 0 ? (
            <span className="ml-auto font-bold text-foreground">₹{(displayPriceInr / 100).toFixed(0)}</span>
          ) : displayPriceUsd != null && displayPriceUsd > 0 ? (
            <span className="ml-auto font-bold text-foreground">${(displayPriceUsd / 100).toFixed(0)}</span>
          ) : (
            <span className="ml-auto font-bold text-emerald-600">Free</span>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-2">
        {done ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3">
            <CheckCircle2 className="size-4 shrink-0" />
            You're registered! Check your email.
          </div>
        ) : (
          <>
            {isPaid && !isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground">
                Sign in to access the special offer price
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              className={cn("w-full rounded-xl gap-2 font-semibold", full && "opacity-50 cursor-not-allowed")}
              disabled={full || checkout.isPending}
              onClick={handleJoin}
            >
              {checkout.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> {isPaid ? "Processing payment…" : "Registering…"}</>
              ) : !isAuthenticated ? (
                <><LogIn className="size-4" /> Sign in to Register</>
              ) : full ? (
                "Workshop Full"
              ) : isPaid ? (
                <>Pay & Reserve Spot <ArrowRight className="size-4" /></>
              ) : (
                <>Reserve My Spot <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
