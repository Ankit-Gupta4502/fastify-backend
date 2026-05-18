import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarDays, Clock, Users, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { NextClassCard } from "./_components/NextClassCard";
import { ScheduleList } from "./_components/ScheduleList";
import { useInstructorSchedule } from "@/hooks/use-rooms";
import { INSTRUCTOR_IANA, INSTRUCTOR_TIMEZONE_LABEL } from "@/constants/sessions";

export const Route = createFileRoute("/instructor/dashboard")({
  component: InstructorDashboard,
});

function InstructorDashboard() {
  const { user } = useAuthStore();
  const schedule = useInstructorSchedule();
  const rooms = schedule.data?.data ?? [];

  const total = rooms.length;
  const live = rooms.filter((r) => r.status === "active").length;
  const seats = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const nextRoom = rooms.find((r) => r.status !== "active") ?? rooms[0];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
            Instructor Console
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Hello, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your schedule is shown in{" "}
            <span className="font-medium">{INSTRUCTOR_TIMEZONE_LABEL}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="size-2 rounded-full bg-emerald-500 mr-2 animate-pulse inline-block" />
            Available
          </Badge>
          <Link
            to="/instructor/profile"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors border border-border/60 px-3 py-2 rounded-full hover:border-primary/40"
          >
            <UserCircle className="size-3.5" />
            Edit profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Upcoming"
          value={String(total)}
          icon={CalendarDays}
          bg="bg-primary/10"
          accent="text-primary"
          loading={schedule.isLoading}
        />
        <StatCard
          label="Live now"
          value={String(live)}
          icon={Activity}
          bg="bg-accent/10"
          accent="text-accent"
          loading={schedule.isLoading}
        />
        <StatCard
          label="Seats booked"
          value={String(seats)}
          icon={Users}
          bg="bg-blue-50 dark:bg-blue-500/10"
          accent="text-blue-500"
          loading={schedule.isLoading}
        />
        <StatCard
          label="Time zone"
          value={INSTRUCTOR_IANA}
          icon={Clock}
          bg="bg-orange-50 dark:bg-orange-500/10"
          accent="text-orange-500"
        />
      </div>

      <NextClassCard room={nextRoom} isLoading={schedule.isLoading} />

      <ScheduleList rooms={rooms} isLoading={schedule.isLoading} />
    </div>
  );
}
