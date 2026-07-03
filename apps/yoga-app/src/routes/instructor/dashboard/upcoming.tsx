import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Instructor Console</p>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Upcoming Sessions</h1>
        <p className="text-muted-foreground">
          Search, filter, and browse your full schedule as a list or on a calendar.
        </p>
      </div>

      <ScheduleFilters
        filters={filters}
        setFilter={setFilter}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        resultCount={filteredRooms.length}
      />

      <ScheduleViewToggle view={view} onChange={setView} />

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
          rooms={filteredRooms}
          isLoading={schedule.isLoading}
          joiningId={joiningId}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
}
