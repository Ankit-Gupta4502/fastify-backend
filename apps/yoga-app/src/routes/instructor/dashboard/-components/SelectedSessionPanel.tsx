import { X } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/timezone";
import { INSTRUCTOR_IANA } from "@/constants/sessions";

interface SelectedSessionPanelProps {
  room: InstructorScheduleRoom;
  joiningId: string | null;
  onJoin: (room: InstructorScheduleRoom) => void;
  onClose: () => void;
}

export function SelectedSessionPanel({ room, joiningId, onJoin, onClose }: SelectedSessionPanelProps) {
  return (
    <div className="flex items-start justify-between gap-3">
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

        <Button
          size="sm"
          variant={room.canJoinLive ? "default" : "outline"}
          disabled={!room.canJoinLive || joiningId === room.id}
          className={cn(
            "rounded-full mt-2",
            room.canJoinLive && room.status === "active" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
          )}
          onClick={() => room.canJoinLive && onJoin(room)}
        >
          {joiningId === room.id
            ? "Opening…"
            : room.meetLink
              ? room.status === "active" ? "Rejoin Meet" : "Open Meet"
              : room.status === "active"
                ? "Rejoin"
                : room.canJoinLive
                  ? "Open"
                  : "Upcoming"}
        </Button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted shrink-0"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
