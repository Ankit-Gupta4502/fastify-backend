import { Activity, CalendarDays, Clock, Users } from "lucide-react";
import { StatCard } from "@/shared/components/misc/stat-card";
import { INSTRUCTOR_IANA } from "@/features/instructor/constants/sessions";

interface DashboardStatsProps {
  total: number;
  live: number;
  seats: number;
  isLoading: boolean;
}

export function DashboardStats({ total, live, seats, isLoading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        label="Upcoming"
        value={String(total)}
        icon={CalendarDays}
        bg="bg-primary/10"
        accent="text-primary"
        loading={isLoading}
      />
      <StatCard
        label="Live now"
        value={String(live)}
        icon={Activity}
        bg="bg-accent/10"
        accent="text-accent"
        loading={isLoading}
      />
      <StatCard
        label="Seats booked"
        value={String(seats)}
        icon={Users}
        bg="bg-blue-50 dark:bg-blue-500/10"
        accent="text-blue-500"
        loading={isLoading}
      />
      <StatCard
        label="Time zone"
        value={INSTRUCTOR_IANA}
        icon={Clock}
        bg="bg-orange-50 dark:bg-orange-500/10"
        accent="text-orange-500"
      />
    </div>
  );
}
