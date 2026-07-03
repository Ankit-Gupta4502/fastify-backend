import { Link } from "@tanstack/react-router";
import { Users, Video } from "lucide-react";
import type { UpcomingRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCompact, userTimezone } from "@/lib/timezone";
import { Chip } from "@/components/shared/Chip";


interface UpcomingSessionListProps {
  rooms: UpcomingRoom[];
  isLoading: boolean;
  actingId: string | null;
  onEnrol: (roomId: string) => void;
  onJoinLive: (roomId: string) => void;
}

export function UpcomingSessionList({
  rooms,
  isLoading,
  actingId,
  onEnrol,
  onJoinLive,
}: UpcomingSessionListProps) {
  const timezone = userTimezone();
  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-serif font-bold">More sessions</h2>
        <Button asChild variant="ghost" className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
          <Link to="/rooms">View all</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">No other sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const full = room.spotsLeft <= 0 || room.status === "full";
            const live = room.canJoinLive;
            const acting = actingId === room.id;

            return (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-10 rounded-full bg-background flex items-center justify-center text-primary border border-border/50 shrink-0">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{room.instructor.name}</p>
                      {room.isEnrolled && <Chip variant="info">Enrolled</Chip>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCompact(room.scheduledStartUtc, timezone)} · {room.currentOccupancy}/{room.capacity}
                    </p>
                  </div>
                </div>

                {room.isEnrolled ? (
                  live && room.meetLink ? (
                    <a
                      href={room.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      <Video className="size-3.5" />
                      Join Meet
                    </a>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!live || acting}
                      onClick={() => onJoinLive(room.id)}
                      className={cn(
                        "rounded-full shrink-0",
                        live ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
                      )}
                      variant={live ? "default" : "outline"}
                    >
                      {acting ? "Joining…" : live ? "Join Live" : "Enrolled ✓"}
                    </Button>
                  )
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full shrink-0"
                    disabled={full || acting}
                    onClick={() => onEnrol(room.id)}
                  >
                    {acting ? "Reserving…" : full ? "Full" : "Reserve"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
