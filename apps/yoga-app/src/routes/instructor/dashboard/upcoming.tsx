import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useInstructorSchedule } from "@/hooks/use-rooms";
import { useJoinLiveRoom } from "@/hooks/use-join-live-room";
import { useScheduleFilters } from "@/hooks/use-schedule-filters";
import { ScheduleList } from "../-components/ScheduleList";
import { ScheduleFilters } from "./-components/ScheduleFilters";
import { ScheduleViewToggle, type ScheduleView } from "./-components/ScheduleViewToggle";
import { ScheduleCalendarView } from "./-components/ScheduleCalendarView";

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
