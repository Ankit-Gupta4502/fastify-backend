import { Sparkles, TrendingUp, Video } from "lucide-react";
import type { UpcomingRoom } from "@yoga-app/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatCompact, relativeFromNow, userTimezone } from "@/shared/lib/timezone";
import { Chip } from "@/shared/components/misc/chip";
import { EmptyState } from "@/shared/components/misc/empty-state";



interface NextFlowCardProps {
  room: UpcomingRoom | undefined;
  isLoading: boolean;
  actingId: string | null;
  onEnrol: (roomId: string) => void;
  onJoinLive: (roomId: string) => void;
}

export function NextFlowCard({
  room,
  isLoading,
  actingId,
  onEnrol,
  onJoinLive,
}: NextFlowCardProps) {
  const timezone = userTimezone();
  return (
    <Card className="lg:col-span-2 border-none shadow-sm bg-card/50 overflow-hidden rounded-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Your next flow</CardTitle>
            <CardDescription>Upcoming sessions</CardDescription>
          </div>
          {room && (
            <Chip variant="info" icon={TrendingUp} size="md">
              {relativeFromNow(room.scheduledStartUtc)}
            </Chip>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : !room ? (
          <EmptyState
            icon={Sparkles}
            title="No upcoming sessions"
            description="Browse all sessions to find your next flow."
            action={{ label: "Browse rooms", to: "/rooms" }}
          />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="size-20 rounded-2xl bg-linear-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-9" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-serif font-bold">{room.instructor.name}</h3>
                {room.isEnrolled && <Chip variant="info">Enrolled</Chip>}
              </div>
              <p className="text-sm text-muted-foreground">{formatCompact(room.scheduledStartUtc, timezone)}</p>
              <div className="flex flex-wrap gap-1.5">
                {room.instructor.specialty.slice(0, 3).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            </div>

            {room.isExpired ? (
              <span className="text-sm text-muted-foreground shrink-0">Session ended</span>
            ) : room.isEnrolled ? (
              room.canJoinLive && room.meetLink ? (
                <a
                  href={room.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-2.5 font-bold text-sm shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  <Video className="size-4" />
                  Join on Meet
                </a>
              ) : (
                <Button
                  size="lg"
                  disabled={!room.canJoinLive || actingId === room.id}
                  onClick={() => onJoinLive(room.id)}
                  className={cn(
                    "rounded-full px-8 font-bold shrink-0",
                    room.canJoinLive
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                      : "shadow-none",
                  )}
                >
                  {actingId === room.id ? "Joining…" : room.canJoinLive ? "Join Live" : "Enrolled ✓"}
                </Button>
              )
            ) : (
              <Button
                size="lg"
                className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 shrink-0"
                disabled={room.spotsLeft <= 0 || actingId === room.id}
                onClick={() => onEnrol(room.id)}
              >
                {actingId === room.id ? "Reserving…" : room.spotsLeft <= 0 ? "Full" : "Reserve spot"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
