import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Flame, Wallet,  ArrowRight, } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/shared/StatCard";
import { NextFlowCard } from "../-components/dashboard/NextFlowCard";
import { PlanCard } from "../-components/dashboard/PlanCard";
import { UpcomingSessionList } from "../-components/dashboard/UpcomingSessionList";
import { BookPrivateSessionDialog } from "../-components/dashboard/BookPrivateSessionDialog";
import { useUpcomingRooms, useEnrolRoom, useJoinRoom } from "@/hooks/use-rooms";
import { useMyPlan } from "@/hooks/use-plans";
import { useMyPreferences } from "@/hooks/use-user-preferences";
import { Button } from "@/components/ui/button";
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
  const limit = plan?.sessionsPerWeek ?? null;
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

      {/* Trial / demo status banner — only show if no preferences set */}
     
      {/* Preferences summary */}
      
        <div className="rounded-2xl border border-border/60 bg-card/60 px-5 py-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your profile</p>
            <div className="flex flex-wrap gap-2">
              {preferences?.purposes.map((p: string) => (
                <span key={p} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{p}</span>
              ))}
              {preferences?.preferredTimeOfDay && (
                <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  {preferences.preferredTimeOfDay} sessions
                </span>
              )}
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full shrink-0 gap-1.5 font-bold">
            <Link  to="/edit-profile">
              Edit <ArrowRight className="size-3.5" />
            </Link>
          </Button>
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

      {/* Rest of upcoming rooms */}
      <UpcomingSessionList
        rooms={rooms.slice(1, 6)}
        isLoading={upcoming.isLoading}
        actingId={actingId}
        onEnrol={handleEnrol}
        onJoinLive={handleJoinLive}
      />

      <BookPrivateSessionDialog
        open={bookPrivateOpen}
        onOpenChange={setBookPrivateOpen}
      />
    </div>
  );
}
