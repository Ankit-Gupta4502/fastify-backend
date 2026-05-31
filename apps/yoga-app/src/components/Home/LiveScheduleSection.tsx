import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIntersection } from "@/hooks/use-intersection";
import { usePublicRooms } from "@/hooks/use-rooms";
import type { PublicRoomPreview } from "@yoga-app/shared";

// ── Countdown hook ────────────────────────────────────────────────────────────

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  isPast: boolean;
}

function useCountdown(targetUtc: string): TimeLeft {
  const compute = (): TimeLeft => {
    const diff = new Date(targetUtc).getTime() - Date.now();
    if (diff < 0) return { hours: 0, minutes: 0, seconds: 0, isLive: false, isPast: true };
    // Within 15-min window = live join open
    const isLive = diff <= 15 * 60 * 1000;
    return {
      hours: Math.floor(diff / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
      isLive,
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(compute), 1_000);
    return () => clearInterval(id);
  }, [targetUtc]); // re-subscribe only if the target changes

  return timeLeft;
}

// ── Session row ───────────────────────────────────────────────────────────────

function SessionRow({ room }: { room: PublicRoomPreview }) {
  const time = useCountdown(room.scheduledStartUtc);

  const occupancyPct = Math.min(100, Math.round((room.currentOccupancy / room.capacity) * 100));
  const isFull = room.spotsLeft === 0;

  const formattedTime = useMemo(() => {
    return new Date(room.scheduledStartUtc).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [room.scheduledStartUtc]);

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/25 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Time + instructor */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="size-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
          <Calendar className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{room.instructor.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {room.instructor.specialty.slice(0, 2).join(" · ") || "Yoga"} · {formattedTime}
          </p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="sm:w-32 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {room.currentOccupancy}/{room.capacity}
          </span>
          <span className={cn(isFull ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
            {isFull ? "Full" : `${room.spotsLeft} left`}
          </span>
        </div>
        <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              occupancyPct > 80 ? "bg-destructive/70" : "bg-primary/70",
            )}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      {/* Countdown / status */}
      <div className="sm:w-36 shrink-0">
        {time.isLive || room.canJoinLive ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live now
          </div>
        ) : time.isPast ? (
          <span className="text-muted-foreground text-xs">Started</span>
        ) : (
          <div className="font-mono text-sm font-bold tabular-nums text-foreground/80">
            {String(time.hours).padStart(2, "0")}:
            {String(time.minutes).padStart(2, "0")}:
            {String(time.seconds).padStart(2, "0")}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LiveScheduleSection() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>();
  const { data, isLoading } = usePublicRooms();

  const sessions = data?.data ?? [];
  const hasLive = sessions.some((r) => r.canJoinLive);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-16 relative overflow-hidden transition-all duration-700 delay-100",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {hasLive && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live now
                </span>
              )}
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Upcoming Classes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              What's on{" "}
              <span className="font-doodle italic text-primary doodle-underline">today</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Real sessions, happening soon. Sign up to reserve your spot.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-full gap-2 sketch-border-sm self-start md:self-auto">
            <Link to="/login">
              See full schedule <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="size-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto">
              <Zap className="size-6 text-primary" />
            </div>
            <p className="font-semibold text-lg">New sessions dropping soon</p>
            <p className="text-sm text-muted-foreground">Sign up to get notified when new classes go live.</p>
            <Button asChild className="rounded-full mt-2">
              <Link to="/login">Get notified</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((room) => (
              <SessionRow key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
