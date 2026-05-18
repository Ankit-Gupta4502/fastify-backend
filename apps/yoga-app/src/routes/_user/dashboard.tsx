import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Flame, Wallet } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { NextFlowCard } from "./_components/dashboard/NextFlowCard";
import { PlanCard } from "./_components/dashboard/PlanCard";
import { UpcomingSessionList } from "./_components/dashboard/UpcomingSessionList";
import { useUpcomingRooms, useJoinRoom } from "@/hooks/use-rooms";
import { useMyPlan } from "@/hooks/use-plans";
import { userTimezone } from "@/lib/timezone";

export const Route = createFileRoute("/_user/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const { user } = useAuthStore();
  const tz = userTimezone();
  const router = useRouter();
  const upcoming = useUpcomingRooms();
  const myPlan = useMyPlan();
  const join = useJoinRoom();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const rooms = upcoming.data?.data ?? [];
  const planRow = myPlan.data?.data;
  const plan = planRow?.plan ?? null;
  const used = planRow?.sessionsUsedThisWeek ?? 0;
  const limit = plan?.sessionsPerWeek ?? null;
  const remaining = limit !== null ? Math.max(limit - used, 0) : null;

  const handleJoin = (roomId: string) => {
    setJoinError(null);
    setJoiningId(roomId);
    join.mutate(roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId }, search: { code } });
      },
      onError: (err) => {
        setJoinError(err instanceof Error ? err.message : "Could not join");
        setJoiningId(null);
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Namaste, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your time zone: <span className="font-medium">{tz}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-full gap-2">
            <Link to="/billing">
              <Wallet className="size-4" />
              Billing
            </Link>
          </Button>
          <Button asChild className="rounded-full gap-2 shadow-lg shadow-primary/20">
            <Link to="/rooms">
              <Sparkles className="size-4" />
              Browse sessions
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Current plan"
          value={plan ? plan.name.replace(/_/g, " ") : "Free trial"}
          icon={Wallet}
          accent="text-primary"
          bg="bg-primary/10"
          loading={myPlan.isLoading}
        />
        <StatCard
          label="Sessions this week"
          value={limit !== null ? `${used} / ${limit}` : String(used)}
          icon={Calendar}
          accent="text-emerald-500"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
          loading={myPlan.isLoading}
        />
        <StatCard
          label="Remaining"
          value={remaining === null ? "Unlimited" : `${remaining} left`}
          icon={Flame}
          accent="text-orange-500"
          bg="bg-orange-50 dark:bg-orange-500/10"
          loading={myPlan.isLoading}
        />
        <StatCard
          label="Upcoming"
          value={String(rooms.length)}
          icon={Clock}
          accent="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-500/10"
          loading={upcoming.isLoading}
        />
      </div>

      {joinError && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 text-destructive p-4 text-sm">
          {joinError}
        </div>
      )}

      {/* Hero + plan card */}
      <div className="grid lg:grid-cols-3 gap-8">
        <NextFlowCard
          room={rooms[0]}
          isLoading={upcoming.isLoading}
          timezone={tz}
          joiningId={joiningId}
          joinPending={join.isPending}
          onJoin={handleJoin}
        />
        <PlanCard plan={plan} sessionsUsed={used} sessionLimit={limit} />
      </div>

      {/* Rest of upcoming rooms */}
      <UpcomingSessionList
        rooms={rooms.slice(1, 6)}
        isLoading={upcoming.isLoading}
        timezone={tz}
        joiningId={joiningId}
        joinPending={join.isPending}
        onJoin={handleJoin}
      />
    </div>
  );
}
