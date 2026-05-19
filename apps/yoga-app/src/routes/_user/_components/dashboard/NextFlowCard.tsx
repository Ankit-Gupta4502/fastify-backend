import { Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp } from "lucide-react";
import type { UpcomingRoom } from "@yoga-app/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { canJoinLive, cn } from "@/lib/utils";
import { formatCompact, relativeFromNow } from "@/lib/timezone";



interface NextFlowCardProps {
  room: UpcomingRoom | undefined;
  isLoading: boolean;
  timezone: string;
  actingId: string | null;
  onEnrol: (roomId: string) => void;
  onJoinLive: (roomId: string) => void;
}

export function NextFlowCard({
  room,
  isLoading,
  timezone,
  actingId,
  onEnrol,
  onJoinLive,
}: NextFlowCardProps) {
  return (
    <Card className="lg:col-span-2 border-none shadow-sm bg-card/50 overflow-hidden rounded-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Your next flow</CardTitle>
            <CardDescription>Auto-converted to {timezone}</CardDescription>
          </div>
          {room && (
            <Badge className="bg-accent/15 text-accent border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <TrendingUp className="size-3 mr-1.5" />
              {relativeFromNow(room.scheduledStartUtc)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : !room ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center space-y-3">
            <Sparkles className="size-7 text-primary/50 mx-auto" />
            <p className="font-bold">No upcoming sessions</p>
            <p className="text-sm text-muted-foreground">Browse all sessions to find your next flow.</p>
            <Button asChild className="rounded-full">
              <Link to="/rooms">Browse rooms</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="size-20 rounded-2xl bg-linear-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-9" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-serif font-bold">{room.instructor.name}</h3>
                {room.isEnrolled && (
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    Enrolled
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{formatCompact(room.scheduledStartUtc, timezone)}</p>
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
            </div>

            {room.isEnrolled ? (
              <Button
                size="lg"
                disabled={!canJoinLive(room) || actingId === room.id}
                onClick={() => onJoinLive(room.id)}
                className={cn(
                  "rounded-full px-8 font-bold shrink-0",
                  canJoinLive(room)
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                    : "shadow-none",
                )}
              >
                {actingId === room.id ? "Joining…" : canJoinLive(room) ? "Join Live" : "Enrolled ✓"}
              </Button>
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
