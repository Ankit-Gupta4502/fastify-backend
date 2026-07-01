import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Flame, Wallet } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/shared/StatCard";
import { NextFlowCard } from "./-components/NextFlowCard";
import { PlanCard } from "./-components/PlanCard";
import { ProfileCard } from "./-components/ProfileCard";
import { BookPrivateSessionDialog } from "./-components/BookPrivateSessionDialog";
import { useUpcomingRooms, useEnrolRoom, useJoinRoom } from "@/hooks/use-rooms";
import { useMyPlan } from "@/hooks/use-plans";
import { useMyPreferences } from "@/hooks/use-user-preferences";
export const Route = createFileRoute("/_user/dashboard/")({
  component: UserDashboard,
});





function UserDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const upcoming = useUpcomingRooms();
  const myPlan = useMyPlan();
  const enrol = useEnrolRoom();
  const join = useJoinRoom();

  const [actingId, setActingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [bookPrivateOpen, setBookPrivateOpen] = useState(false);

  const rooms = upcoming.data?.data ?? [];
  const planRow = myPlan.data?.data;
  const plan = planRow?.plan ?? null;
  const used = planRow?.sessionsUsedThisWeek ?? 0;
  const limit = planRow?.sessionsTotal ?? null; // null = unlimited (group plan); number = purchased session count
  const remaining = limit !== null ? Math.max(limit - used, 0) : null;

  const myPrefs = useMyPreferences();
  const preferences = myPrefs.data?.data ?? null;

  const handleEnrol = (roomId: string) => {
    setActionError(null);
    setActingId(roomId);
    enrol.mutate(roomId, {
      onError: (err) => setActionError(err instanceof Error ? err.message : "Could not reserve spot"),
      onSettled: () => setActingId((c) => (c === roomId ? null : c)),
    });
  };

  const handleJoinLive = (roomId: string) => {
    setActionError(null);
    setActingId(roomId);
    join.mutate(roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId }, search: { code } });
      },
      onError: (err) => {
        setActionError(err instanceof Error ? err.message : "Could not join");
        setActingId(null);
      },
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Namaste, {user?.name?.split(" ")[0]}
        </h1>
      </div>

      <ProfileCard preferences={preferences} isLoading={myPrefs.isLoading} />


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

      {actionError && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 text-destructive p-4 text-sm">
          {actionError}
        </div>
      )}

      {/* Hero + plan card */}
      <div className="grid lg:grid-cols-3 gap-8">
        <NextFlowCard
          room={rooms[0]}
          isLoading={upcoming.isLoading}
          actingId={actingId}
          onEnrol={handleEnrol}
          onJoinLive={handleJoinLive}
        />
        <PlanCard
          plan={plan}
          sessionsUsed={used}
          sessionLimit={limit}
          onBookPrivate={() => setBookPrivateOpen(true)}
        />
      </div>


      <BookPrivateSessionDialog
        open={bookPrivateOpen}
        onOpenChange={setBookPrivateOpen}
      />
    </div>
  );
}
