import { Sparkles, TrendingUp } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
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
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold leading-none">Up next on your mat</h2>
          <p className="text-xs text-muted-foreground mt-1.5">Times are in {INSTRUCTOR_TIMEZONE_LABEL}</p>
        </div>
        {room && (
          <Chip icon={TrendingUp} size="sm">
            {relativeFromNow(room.scheduledStartUtc)}
          </Chip>
        )}
      </div>

      <div>
        {isLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : !room ? (
          <EmptyState
            icon={Sparkles}
            title="No classes scheduled"
            description="Admin will assign upcoming flows here."
          />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="size-12 rounded-xl bg-linear-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-5.5" />
            </div>

            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-serif font-bold capitalize">
                {room.type} session
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatCompact(room.scheduledStartUtc, INSTRUCTOR_IANA)} •{" "}
                {room.currentOccupancy}/{room.capacity} seats
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className={cn("size-2 rounded-full", room.isCancelled ? "bg-destructive" : "bg-primary")} />
                <span className={cn("font-bold uppercase tracking-widest", room.isCancelled ? "text-destructive" : "text-muted-foreground")}>
                  {room.status}
                </span>
              </div>
              {room.isCancelled ? (
                <p className="text-xs text-destructive italic bg-destructive/5 rounded-lg px-2.5 py-1.5">
                  This class was cancelled by admin
                </p>
              ) : (
                room.adminNote && (
                  <p className="text-xs text-muted-foreground italic bg-muted/40 rounded-lg px-2.5 py-1.5">
                    Note from admin: {room.adminNote}
                  </p>
                )
              )}
            </div>

            {room.isCancelled ? (
              <Button
                variant="outline"
                disabled
                title="This class was cancelled by admin"
                className="rounded-full px-6 font-bold shrink-0 opacity-60"
              >
                Cancelled
              </Button>
            ) : room.canJoinLive ? (
              <Button
                disabled={joiningId === room.id}
                onClick={() => onJoin(room)}
                className={cn(
                  "rounded-full px-6 font-bold shrink-0",
                  "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20",
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
                variant="outline"
                disabled
                className="rounded-full px-6 font-bold shrink-0 opacity-60"
              >
                {formatCompact(room.scheduledStartUtc, INSTRUCTOR_IANA)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
