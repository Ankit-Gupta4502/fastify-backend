import { Users, Clock } from "lucide-react";
import type { UpcomingRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompact, relativeFromNow } from "@/lib/timezone";
import { Chip } from "@/components/shared/chip";

interface SessionRowProps {
  room: UpcomingRoom;
  tz: string;
  acting: boolean;
  onEnrol: (id: string) => void;
  onJoinLive: (id: string) => void;
}

export function SessionRow({ room, tz, acting, onEnrol, onJoinLive }: SessionRowProps) {
  const full = room.spotsLeft <= 0 || room.status === "full";
  const live = room.canJoinLive;
  const isActive = room.status === "active";

  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors group">
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="space-y-0.5">
          <div className="font-medium text-foreground">{formatCompact(room.scheduledStartUtc, tz)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {relativeFromNow(room.scheduledStartUtc)}
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5 font-semibold whitespace-nowrap">{room.instructor.name}</td>

      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {room.instructor.specialty.slice(0, 3).map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5" />
          <span className="text-foreground font-medium">{room.spotsLeft}</span>
          <span className="text-xs">/ {room.capacity}</span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
          isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : full ? "bg-secondary text-muted-foreground"
            : room.isEnrolled ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "bg-primary/10 text-primary",
        )}>
          <span className={cn(
            "size-1.5 rounded-full",
            isActive ? "bg-emerald-500 animate-pulse"
              : full ? "bg-muted-foreground/40"
              : room.isEnrolled ? "bg-blue-500"
              : "bg-primary/40",
          )} />
          {isActive ? "Live" : full ? "Full" : room.isEnrolled ? "Enrolled" : "Upcoming"}
        </span>
      </td>

      <td className="px-4 py-3.5 text-right">
        {room.isEnrolled ? (
          <Button
            size="sm"
            disabled={!live || acting}
            onClick={() => onJoinLive(room.id)}
            className={cn(
              "rounded-full px-5 font-bold",
              live
                ? "opacity-100 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                : "opacity-60 group-hover:opacity-80",
            )}
          >
            {acting ? "Joining…" : live ? "Join Live" : "Enrolled ✓"}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={full || acting}
            onClick={() => onEnrol(room.id)}
            className="rounded-full px-5 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {acting ? "Reserving…" : full ? "Full" : "Reserve"}
          </Button>
        )}
      </td>
    </tr>
  );
}
