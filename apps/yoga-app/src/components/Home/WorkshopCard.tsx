import { useState } from "react";
import { CalendarDays, Users, Video, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useJoinWorkshop } from "@/hooks/use-workshops";
import type { Workshop } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/lib/timezone";

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const tz = userTimezone();
  const join = useJoinWorkshop();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spotsLeft = workshop.maxAttendees - workshop.attendeeCount;
  const full = spotsLeft <= 0;

  const handleJoin = () => {
    if (!name.trim() || !email.trim()) return;
    setError(null);
    join.mutate(
      { id: workshop.id, body: { name: name.trim(), email: email.trim() } },
      {
        onSuccess: () => setDone(true),
        onError: (err) => setError(err instanceof Error ? err.message : "Could not register"),
      },
    );
  };

  return (
    <div className="group relative flex flex-col rounded-3xl border border-border/60 bg-card overflow-hidden hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 flex-1 space-y-4">
        {/* Date / time */}
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

        {/* Meta row */}
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
          {workshop.priceInr != null && workshop.priceInr > 0 ? (
            <span className="ml-auto font-bold text-foreground">
              ₹{(workshop.priceInr / 100).toFixed(0)}
            </span>
          ) : workshop.priceUsd != null && workshop.priceUsd > 0 ? (
            <span className="ml-auto font-bold text-foreground">
              ${(workshop.priceUsd / 100).toFixed(0)}
            </span>
          ) : (
            <span className="ml-auto font-bold text-emerald-600">Free</span>
          )}
        </div>
      </div>

      {/* Join form / CTA */}
      <div className="px-6 pb-6">
        {done ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3">
            <CheckCircle2 className="size-4 shrink-0" />
            You're registered! Check your email.
          </div>
        ) : open ? (
          <div className="space-y-2.5">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl text-sm"
            />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl text-sm"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 rounded-xl gap-1.5"
                disabled={join.isPending || !name.trim() || !email.trim()}
                onClick={handleJoin}
              >
                {join.isPending ? (
                  <><Loader2 className="size-3.5 animate-spin" /> Registering…</>
                ) : (
                  <>Confirm <ArrowRight className="size-3.5" /></>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => { setOpen(false); setError(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className={cn(
              "w-full rounded-xl gap-2 font-semibold",
              full && "opacity-50 cursor-not-allowed",
            )}
            disabled={full}
            onClick={() => setOpen(true)}
          >
            {full ? "Workshop Full" : "Reserve My Spot"}
            {!full && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
