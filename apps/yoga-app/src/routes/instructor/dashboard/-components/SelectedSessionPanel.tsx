import { X } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/timezone";
import { INSTRUCTOR_IANA } from "@/constants/sessions";

interface SelectedSessionPanelProps {
  room: InstructorScheduleRoom;
  joiningId: string | null;
  onJoin: (roomId: string) => void;
  onClose: () => void;
}

export function SelectedSessionPanel({ room, joiningId, onJoin, onClose }: SelectedSessionPanelProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 flex items-start justify-between gap-4">
      <div className="space-y-1.5 min-w-0">
        <p className="font-bold text-sm capitalize">{room.type} session</p>
        <p className="text-xs text-muted-foreground">
          {formatCompact(room.scheduledStartUtc, INSTRUCTOR_IANA)} –{" "}
          {formatCompact(room.scheduledEndUtc, INSTRUCTOR_IANA)}
        </p>
        <p className="text-xs text-muted-foreground">
          {room.currentOccupancy}/{room.capacity} seats •{" "}
          <span className="uppercase tracking-widest font-bold">{room.status}</span>
        </p>
        {room.adminNote && (
          <p className="text-xs text-muted-foreground italic mt-1">Note from admin: {room.adminNote}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={room.canJoinLive ? "default" : "outline"}
          disabled={!room.canJoinLive || joiningId === room.id}
          className={cn(
            "rounded-full",
            room.canJoinLive && room.status === "active" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
          )}
          onClick={() => room.canJoinLive && onJoin(room.id)}
        >
          {joiningId === room.id
            ? "Opening…"
            : room.status === "active"
              ? "Rejoin"
              : room.canJoinLive
                ? "Open"
                : "Upcoming"}
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
