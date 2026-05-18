import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/timezone";
import { INSTRUCTOR_IANA, INSTRUCTOR_TIMEZONE_LABEL } from "@/constants/sessions";

interface ScheduleListProps {
  rooms: InstructorScheduleRoom[];
  isLoading: boolean;
}

export function ScheduleList({ rooms, isLoading }: ScheduleListProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-serif font-bold">Your schedule</h2>
        <p className="text-xs text-muted-foreground">
          All times in {INSTRUCTOR_TIMEZONE_LABEL}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center shrink-0 border border-border/50",
                    room.status === "active"
                      ? "bg-accent/20 text-accent"
                      : "bg-background text-primary",
                  )}
                >
                  <Activity className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm capitalize">{room.type} session</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCompact(room.scheduledStartUtc, INSTRUCTOR_IANA)} •{" "}
                    {room.currentOccupancy}/{room.capacity} seats •{" "}
                    <span className="uppercase tracking-widest font-bold">
                      {room.status}
                    </span>
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                variant={room.status === "active" ? "default" : "outline"}
                className="rounded-full shrink-0"
              >
                <Link
                  to="/session/$roomId"
                  params={{ roomId: room.id }}
                  search={{ code: undefined }}
                >
                  {room.status === "active" ? "Rejoin" : "Open"}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
