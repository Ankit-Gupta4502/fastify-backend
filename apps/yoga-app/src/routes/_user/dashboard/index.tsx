import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Flame, Wallet, PartyPopper, ArrowRight, Hourglass, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/shared/StatCard";
import { NextFlowCard } from "../-components/dashboard/NextFlowCard";
import { PlanCard } from "../-components/dashboard/PlanCard";
import { UpcomingSessionList } from "../-components/dashboard/UpcomingSessionList";
import { BookPrivateSessionDialog } from "../-components/dashboard/BookPrivateSessionDialog";
import { useUpcomingRooms, useEnrolRoom, useJoinRoom } from "@/hooks/use-rooms";
import { useMyPlan } from "@/hooks/use-plans";
import { useMyDemoRequests } from "@/hooks/use-demo";
import { Button } from "@/components/ui/button";
import type { DemoRequestStatus } from "@yoga-app/shared";
export const Route = createFileRoute("/_user/dashboard/")({
  component: UserDashboard,
});

const DEMO_BANNER_CONFIG: Record<string, {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel: string;
  style: string;
  iconStyle: string;
}> = {
  completed: {
    icon: PartyPopper,
    title: "Free demo complete!",
    description: "You've finished your free class. Choose a plan to keep your practice going.",
    ctaLabel: "View plans",
    style: "border-emerald-200 bg-emerald-50 dark:bg-emerald-500/8 dark:border-emerald-500/20",
    iconStyle: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  pending: {
    icon: Hourglass,
    title: "Demo class pending review",
    description: "Your free demo request is being reviewed. We'll notify you once it's confirmed.",
    ctaLabel: "View plans",
    style: "border-amber-200 bg-amber-50 dark:bg-amber-500/8 dark:border-amber-500/20",
    iconStyle: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  rejected: {
    icon: AlertCircle,
    title: "Demo request not approved",
    description: "Your demo request wasn't approved. You can still pick a plan and get started right away.",
    ctaLabel: "Choose a plan",
    style: "border-red-200 bg-red-50 dark:bg-red-500/8 dark:border-red-500/20",
    iconStyle: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",
  },
  no_demo: {
    icon: PartyPopper,
    title: "Welcome! Book your free demo",
    description: "You haven't booked a free class yet. Try one on us — no card required.",
    ctaLabel: "Book free demo",
    style: "border-primary/20 bg-primary/5 dark:bg-primary/8",
    iconStyle: "bg-primary/10 text-primary",
  },
};

function TrialStatusBanner({ status }: { status: DemoRequestStatus | null }) {
  const key = status === "completed" ? "completed"
    : status === "pending" || status === "needs_information" ? "pending"
    : status === "rejected" ? "rejected"
    : status === "approved" || status === "instructor_assigned" || status === "meeting_scheduled" ? null
    : "no_demo";

  if (!key) return null;

  const cfg = DEMO_BANNER_CONFIG[key];
  const Icon = cfg.icon;
  const to = key === "no_demo" ? "/demo" : "/billing";

  return (
    <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${cfg.style}`}>
      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconStyle}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{cfg.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
      </div>
      <Button asChild size="sm" variant="outline" className="rounded-full shrink-0 gap-1.5 font-bold">
        <Link to={to}>
          {cfg.ctaLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function UserDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const upcoming = useUpcomingRooms();
  const myPlan = useMyPlan();
  const myDemo = useMyDemoRequests();
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

  const latestDemo = myDemo.data?.data?.[0] ?? null;
  const demoStatus: DemoRequestStatus | null = latestDemo?.status ?? null;
  const showTrialBanner = !plan && !myPlan.isLoading && !myDemo.isLoading;

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

      {/* Trial / demo status banner */}
      {showTrialBanner && <TrialStatusBanner status={demoStatus} />}

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
