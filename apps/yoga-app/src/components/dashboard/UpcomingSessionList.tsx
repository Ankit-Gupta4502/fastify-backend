import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import type { UpcomingRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact } from "@/lib/timezone";

interface UpcomingSessionListProps {
  rooms: UpcomingRoom[];
  isLoading: boolean;
  timezone: string;
  joiningId: string | null;
  joinPending: boolean;
  onJoin: (roomId: string) => void;
}

export function UpcomingSessionList({
  rooms,
  isLoading,
  timezone,
  joiningId,
  joinPending,
  onJoin,
}: UpcomingSessionListProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-serif font-bold">More sessions</h2>
        <Button
          asChild
          variant="ghost"
          className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
        >
          <Link to="/rooms">View all</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">No other sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="size-10 rounded-full bg-background flex items-center justify-center text-primary border border-border/50 shrink-0">
                  <Users className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{room.instructor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCompact(room.scheduledStartUtc, timezone)} •{" "}
                    {room.currentOccupancy}/{room.capacity}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="rounded-full shrink-0"
                disabled={room.spotsLeft <= 0 || joiningId === room.id || joinPending}
                onClick={() => onJoin(room.id)}
              >
                {joiningId === room.id ? "Joining..." : room.spotsLeft <= 0 ? "Full" : "Join"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
