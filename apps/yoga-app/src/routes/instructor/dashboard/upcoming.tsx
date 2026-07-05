import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useInstructorSchedule } from "@/features/booking/hooks/use-rooms";
import { useJoinLiveRoom } from "@/features/sessions/hooks/use-join-live-room";
import { useScheduleFilters } from "@/features/instructor/hooks/use-schedule-filters";
import { ScheduleList } from "@/features/instructor/components/schedule-list";
import { ScheduleFilters } from "@/features/instructor/components/dashboard/schedule-filters";
import { ScheduleViewToggle, type ScheduleView } from "@/features/instructor/components/dashboard/schedule-view-toggle";
import { ScheduleCalendarView } from "@/features/instructor/components/dashboard/schedule-calendar-view";

export const Route = createFileRoute("/instructor/dashboard/upcoming")({
  component: UpcomingSessionsPage,
});

function UpcomingSessionsPage() {
  const schedule = useInstructorSchedule();
  const { joiningId, joinError, handleJoin } = useJoinLiveRoom();
  const rooms = schedule.data?.data ?? [];
  const { filters, setFilter, resetFilters, hasActiveFilters, filteredRooms } = useScheduleFilters(rooms);

  const [view, setView] = useState<ScheduleView>("list");
  const isCalendar = view === "calendar";

  return (
    <div
      className={cn(
        "max-w-6xl mx-auto flex flex-col gap-6",
        isCalendar ? "h-[calc(100dvh-8rem)]" : "pb-12",
      )}
    >
      <ScheduleViewToggle view={view} onChange={setView} />

      {!isCalendar && (
        <ScheduleFilters
          filters={filters}
          setFilter={setFilter}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          resultCount={filteredRooms.length}
        />
      )}

      {joinError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          {joinError}
        </div>
      )}

      {view === "list" ? (
        <ScheduleList
          rooms={filteredRooms}
          isLoading={schedule.isLoading}
          joiningId={joiningId}
          onJoin={handleJoin}
        />
      ) : (
        <ScheduleCalendarView
          className="flex-1 min-h-0"
          rooms={rooms}
          isLoading={schedule.isLoading}
          joiningId={joiningId}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
}
