import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, type EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Lock, Users } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { INSTRUCTOR_TIMEZONE_LABEL } from "@/features/instructor/constants/sessions";
import { SelectedSessionPanel } from "@/features/instructor/components/dashboard/selected-session-panel";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/schedule-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { "en-US": enUS },
});

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: InstructorScheduleRoom;
}

const STATUS_COLORS: Record<InstructorScheduleRoom["status"], { bg: string; text: string }> = {
  active: { bg: "#10b981", text: "#ffffff" }, // emerald-500
  idle: { bg: "var(--primary)", text: "var(--primary-foreground)" },
  full: { bg: "#f59e0b", text: "#ffffff" }, // amber-500
  ended: { bg: "var(--muted)", text: "var(--muted-foreground)" },
  cancelled: { bg: "var(--destructive)", text: "#ffffff" },
};

function EventContent({ event }: EventProps<ScheduleEvent>) {
  const Icon = event.resource.type === "private" ? Lock : Users;
  return (
    <div className="flex items-center gap-1 min-w-0">
      <Icon className="size-3 shrink-0" />
      <span className="truncate capitalize">{event.resource.type}</span>
      <span className="opacity-80 shrink-0">
        {event.resource.currentOccupancy}/{event.resource.capacity}
      </span>
    </div>
  );
}

interface ScheduleCalendarViewProps {
  rooms: InstructorScheduleRoom[];
  isLoading: boolean;
  joiningId: string | null;
  onJoin: (room: InstructorScheduleRoom) => void;
  className?: string;
}

export function ScheduleCalendarView({ rooms, isLoading, joiningId, onJoin, className }: ScheduleCalendarViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<InstructorScheduleRoom | null>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);

  const events = useMemo<ScheduleEvent[]>(
    () =>
      rooms.map((room) => ({
        id: room.id,
        title: `${room.type} session`,
        start: new Date(room.scheduledStartUtc),
        end: new Date(room.scheduledEndUtc),
        resource: room,
      })),
    [rooms],
  );

  // Anchor the popover at the click point rather than the event element —
  // events can be tiny slivers in month view, which makes a poor anchor.
  const handleSelectEvent = (event: ScheduleEvent, e: React.SyntheticEvent<HTMLElement>) => {
    const { clientX, clientY } = e as unknown as MouseEvent;
    setAnchorPos({ x: clientX, y: clientY });
    setSelectedRoom(event.resource);
  };

  if (isLoading) {
    return <Skeleton className={cn("rounded-2xl", className ?? "h-175")} />;
  }

  return (
    <div className={cn("flex flex-col gap-4 min-h-0", className)}>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span className="font-medium">All times in {INSTRUCTOR_TIMEZONE_LABEL}</span>
        <div className="flex items-center gap-3">
          {(
            [
              ["Idle", "idle"],
              ["Active", "active"],
              ["Full", "full"],
              ["Ended", "ended"],
              ["Cancelled", "cancelled"],
            ] as const
          ).map(([label, status]) => (
            <span key={status} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: STATUS_COLORS[status].bg }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-2xl border border-border/60 bg-card p-3 md:p-4">
        <Calendar
          className="instructor-calendar"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.WEEK}
          popup
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => {
            const colors = STATUS_COLORS[event.resource.status];
            return {
              style: {
                backgroundColor: colors.bg,
                color: colors.text,
                opacity: event.resource.status === "ended" || event.resource.isCancelled ? 0.6 : 1,
              },
            };
          }}
          components={{ event: EventContent }}
        />
      </div>

      <Popover open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <PopoverAnchor asChild>
          <span
            className="fixed pointer-events-none"
            style={{ left: anchorPos?.x ?? 0, top: anchorPos?.y ?? 0, width: 1, height: 1 }}
          />
        </PopoverAnchor>
        <PopoverContent className="w-80" onOpenAutoFocus={(e) => e.preventDefault()}>
          {selectedRoom && (
            <SelectedSessionPanel
              room={selectedRoom}
              joiningId={joiningId}
              onJoin={(room) => {
                onJoin(room);
                setSelectedRoom(null);
              }}
              onClose={() => setSelectedRoom(null)}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
