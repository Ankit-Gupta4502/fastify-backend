import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { NextClassCard } from "../-components/NextClassCard";
import { useJoinLiveRoom } from "@/hooks/use-join-live-room";
import { useInstructorSchedule } from "@/hooks/use-rooms";
import { useInstructorWallet } from "@/hooks/use-instructors";
import { useInstructorDemoSessions } from "@/hooks/use-demo";
import { DashboardHeader } from "./-components/DashboardHeader";
import { DashboardStats } from "./-components/DashboardStats";
import { EarningsBanner } from "./-components/EarningsBanner";
import { ViewScheduleBanner } from "./-components/ViewScheduleBanner";
import { DemoSessionsSection } from "./-components/DemoSessionsSection";

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
