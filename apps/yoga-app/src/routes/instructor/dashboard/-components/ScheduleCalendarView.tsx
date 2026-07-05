import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, type EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Lock, Users } from "lucide-react";
import type { InstructorScheduleRoom } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { INSTRUCTOR_TIMEZONE_LABEL } from "@/constants/sessions";
import { SelectedSessionPanel } from "./SelectedSessionPanel";

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
}

export function ScheduleCalendarView({ rooms, isLoading, joiningId, onJoin }: ScheduleCalendarViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selectedRoom = rooms.find((r) => r.id === selectedId) ?? null;

  if (isLoading) {
    return <Skeleton className="h-175 rounded-2xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">All times in {INSTRUCTOR_TIMEZONE_LABEL}</span>
        <div className="flex items-center gap-3">
          {(
            [
              ["Idle", "idle"],
              ["Active", "active"],
              ["Full", "full"],
              ["Ended", "ended"],
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

      <div className={cn("rounded-2xl border border-border/60 bg-card p-3 md:p-4")}>
        <Calendar
          className="instructor-calendar"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 640 }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.WEEK}
          popup
          onSelectEvent={(event) => setSelectedId(event.id)}
          eventPropGetter={(event) => {
            const colors = STATUS_COLORS[event.resource.status];
            return {
              style: {
                backgroundColor: colors.bg,
                color: colors.text,
                opacity: event.resource.status === "ended" ? 0.6 : 1,
              },
            };
          }}
          components={{ event: EventContent }}
        />
      </div>

      {selectedRoom && (
        <SelectedSessionPanel
          room={selectedRoom}
          joiningId={joiningId}
          onJoin={onJoin}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
