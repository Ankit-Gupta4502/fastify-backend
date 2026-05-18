import { Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
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
import { formatCompact, relativeFromNow } from "@/lib/timezone";
import { INSTRUCTOR_IANA, INSTRUCTOR_TIMEZONE_LABEL } from "@/constants/sessions";

interface NextClassCardProps {
  room: InstructorScheduleRoom | undefined;
  isLoading: boolean;
}

export function NextClassCard({ room, isLoading }: NextClassCardProps) {
  return (
    <Card className="border-none shadow-sm bg-card/50 rounded-3xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Up next on your mat</CardTitle>
            <CardDescription>Times are in {INSTRUCTOR_TIMEZONE_LABEL}</CardDescription>
          </div>
          {room && (
            <Badge className="bg-primary/10 text-primary border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
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
            <p className="font-bold">No classes scheduled</p>
            <p className="text-sm text-muted-foreground">
              Admin will assign upcoming flows here.
            </p>
          </div>
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
            </div>

            <Button
              asChild
              size="lg"
              className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 shrink-0"
            >
              <Link to="/session/$roomId" params={{ roomId: room.id }} search={{ code: undefined }}>
                Open studio
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
