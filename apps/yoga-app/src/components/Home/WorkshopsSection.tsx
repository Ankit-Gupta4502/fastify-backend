import { useState } from "react";
import { CalendarDays, Users, Video, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWorkshops, useJoinWorkshop } from "@/hooks/use-workshops";
import type { Workshop } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/lib/timezone";

export function WorkshopsSection() {
  const { data, isLoading } = useWorkshops();
  const workshops = data?.data ?? [];

  if (!isLoading && workshops.length === 0) return null;

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Live Events</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.1]">
              Upcoming <span className="italic text-primary">Workshops</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Join live workshops hosted by expert instructors. Reserve your spot with just your email — no account needed.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

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
          {workshop.price != null && workshop.price > 0 && (
            <span className="ml-auto font-bold text-foreground">
              ₹{(workshop.price / 100).toFixed(0)}
            </span>
          )}
          {(workshop.price === null || workshop.price === 0) && (
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
