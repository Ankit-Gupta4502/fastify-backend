import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { NextClassCard } from "@/features/instructor/components/next-class-card";
import { useJoinLiveRoom } from "@/features/sessions/hooks/use-join-live-room";
import { useInstructorSchedule } from "@/features/booking/hooks/use-rooms";
import { useInstructorWallet } from "@/features/instructor/hooks/use-instructors";
import { useInstructorDemoSessions } from "@/features/demo/hooks/use-demo";
import { DashboardHeader } from "@/features/instructor/components/dashboard/dashboard-header";
import { DashboardStats } from "@/features/instructor/components/dashboard/dashboard-stats";
import { EarningsBanner } from "@/features/instructor/components/dashboard/earnings-banner";
import { ViewScheduleBanner } from "@/features/instructor/components/dashboard/view-schedule-banner";
import { DemoSessionsSection } from "@/features/instructor/components/dashboard/demo-sessions-section";

export const Route = createFileRoute("/instructor/dashboard/")({
  component: InstructorDashboard,
});

function InstructorDashboard() {
  const { user } = useAuthStore();
  const schedule = useInstructorSchedule();
  const wallet = useInstructorWallet();
  const demoSessions = useInstructorDemoSessions();
  const { joiningId, joinError, handleJoin } = useJoinLiveRoom();

  const rooms = schedule.data?.data ?? [];
  const demos = demoSessions.data?.data ?? [];

  const total = rooms.length;
  const live = rooms.filter((r) => r.status === "active").length;
  const seats = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const nextRoom = rooms.find((r) => r.status !== "active") ?? rooms[0];
  const balanceInr = wallet.data?.data?.balanceInr ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <DashboardHeader firstName={user?.name?.split(" ")[0]} />

      <DashboardStats total={total} live={live} seats={seats} isLoading={schedule.isLoading} />

      <EarningsBanner balanceInr={balanceInr} isLoading={wallet.isLoading} />

      <ViewScheduleBanner upcomingCount={total} />

      {joinError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          {joinError}
        </div>
      )}

      <NextClassCard room={nextRoom} isLoading={schedule.isLoading} joiningId={joiningId} onJoin={handleJoin} />

      <DemoSessionsSection demos={demos} isLoading={demoSessions.isLoading} />
    </div>
  );
}
