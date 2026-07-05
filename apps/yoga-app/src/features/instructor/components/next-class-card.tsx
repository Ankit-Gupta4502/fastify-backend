import { Sparkles, TrendingUp } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
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
import { formatCompact, relativeFromNow } from "@/shared/lib/timezone";
import { INSTRUCTOR_IANA, INSTRUCTOR_TIMEZONE_LABEL } from "@/features/instructor/constants/sessions";
import { Chip } from "@/shared/components/misc/chip";
import { EmptyState } from "@/shared/components/misc/empty-state";

interface NextClassCardProps {
  room: InstructorScheduleRoom | undefined;
  isLoading: boolean;
  joiningId: string | null;
  onJoin: (room: InstructorScheduleRoom) => void;
}

export function NextClassCard({ room, isLoading, joiningId, onJoin }: NextClassCardProps) {
  return (
    <Card className="border-none shadow-sm bg-card/50 rounded-3xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Up next on your mat</CardTitle>
            <CardDescription>Times are in {INSTRUCTOR_TIMEZONE_LABEL}</CardDescription>
          </div>
          {room && (
            <Chip icon={TrendingUp} size="md">
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
            title="No classes scheduled"
            description="Admin will assign upcoming flows here."
          />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="size-20 rounded-2xl bg-linear-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-9" />
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-serif font-bold capitalize">
                {room.type} session
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatCompact(room.scheduledStartUtc, INSTRUCTOR_IANA)} •{" "}
                {room.currentOccupancy}/{room.capacity} seats
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full bg-primary" />
                <span className="font-bold uppercase tracking-widest text-muted-foreground">
                  {room.status}
                </span>
              </div>
              {room.adminNote && (
                <p className="text-sm text-muted-foreground italic bg-muted/40 rounded-xl px-3 py-2">
                  Note from admin: {room.adminNote}
                </p>
              )}
            </div>

            {room.canJoinLive ? (
              <Button
                size="lg"
                disabled={joiningId === room.id}
                onClick={() => onJoin(room)}
                className={cn(
                  "rounded-full px-8 font-bold shrink-0",
                  "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20",
                )}
              >
                {joiningId === room.id
                  ? "Opening…"
                  : room.meetLink
                    ? room.status === "active" ? "Rejoin Meet" : "Open Meet"
                    : room.status === "active" ? "Rejoin Studio" : "Open Studio"}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                disabled
                className="rounded-full px-8 font-bold shrink-0 opacity-60"
              >
                {formatCompact(room.scheduledStartUtc, INSTRUCTOR_IANA)}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
