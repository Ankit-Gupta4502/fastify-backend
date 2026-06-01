import { useMemo } from "react";
import { Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicRoomPreview } from "@yoga-app/shared";
import { useCountdown } from "./use-countdown";

export function SessionRow({ room }: { room: PublicRoomPreview }) {
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
