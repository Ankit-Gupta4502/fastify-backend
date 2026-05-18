import { Clock, Users } from "lucide-react";
import type { UpcomingRoom } from "@yoga-app/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompact, relativeFromNow, userTimezone } from "@/lib/timezone";

interface RoomCardProps {
  room: UpcomingRoom;
  onJoin?: (roomId: string) => void;
  joinPending?: boolean;
  joinDisabled?: boolean;
}

export function RoomCard({ room, onJoin, joinPending, joinDisabled }: RoomCardProps) {
  const tz = userTimezone();
  const full = room.spotsLeft <= 0 || room.status === "full";

  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Clock className="size-3" />
              {relativeFromNow(room.scheduledStartUtc)}
            </div>
            <h3 className="text-lg font-bold leading-tight">
              {room.instructor.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatCompact(room.scheduledStartUtc, tz)}
            </p>
          </div>
          <div
            className={cn(
              "size-2.5 rounded-full shrink-0 mt-2",
              room.status === "active" ? "bg-accent animate-pulse" : "bg-primary/30",
            )}
            aria-label={room.status}
          />
        </div>

        {room.instructor.specialty.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {room.instructor.specialty.slice(0, 3).map((s) => (
              <Badge
                key={s}
                className="bg-primary/10 text-primary border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              >
                {s}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span className="font-medium">
              {room.currentOccupancy}/{room.capacity}
            </span>
            <span className="text-xs">
              {full ? "Full" : `${room.spotsLeft} left`}
            </span>
          </div>

          {onJoin && (
            <Button
              size="sm"
              disabled={full || joinPending || joinDisabled}
              onClick={() => onJoin(room.id)}
              className="rounded-full px-5 font-bold"
            >
              {joinPending ? "Joining..." : full ? "Full" : "Join"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
