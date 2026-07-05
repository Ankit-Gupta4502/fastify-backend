import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle2, XCircle, User, Calendar, Lock, ShieldAlert, BarChart2, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPrivateRequests, useJoinRoom } from "@/features/booking/hooks/use-rooms";
import { useMyPlan } from "@/features/payments/hooks/use-plans";
import { BookPrivateSessionDialog } from "@/features/booking/components/book-private-session-dialog";
import type { MyPrivateSessionRequest, PrivateSessionRequestStatus } from "@yoga-app/shared";

const JOIN_WINDOW_MS = 3 * 60 * 1000;

export const Route = createFileRoute("/_user/private-sessions/")({
  component: PrivateSessionsPage,
});

function statusBadge(status: PrivateSessionRequestStatus) {
  if (status === "approved") {
    return (
      <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10">
        <CheckCircle2 className="size-3" />
        Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="gap-1 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10">
        <XCircle className="size-3" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10">
      <Clock className="size-3" />
      Pending
    </Badge>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function RequestCard({ req }: { req: MyPrivateSessionRequest }) {
  const router = useRouter();
  const join = useJoinRoom();
  const now = useNow();
  const [joinError, setJoinError] = useState<string | null>(null);

  const startMs = new Date(req.requestedStart).getTime();
  const endMs = new Date(req.requestedEnd).getTime();
  const joinOpensAtMs = startMs - JOIN_WINDOW_MS;
  const canJoin =
    req.status === "approved" &&
    req.roomId !== null &&
    now >= joinOpensAtMs &&
    now <= endMs;
  const isBeforeJoinWindow = req.status === "approved" && req.roomId !== null && now < joinOpensAtMs;

  function handleJoin() {
    if (!req.roomId) return;
    setJoinError(null);
    join.mutate(req.roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId: req.roomId! }, search: { code } });
      },
      onError: (err) => {
        setJoinError(err instanceof Error ? err.message : "Could not join session");
      },
    });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="size-4 text-primary shrink-0" />
            {formatDateTime(req.requestedStart)}
          </p>
          <p className="text-xs text-muted-foreground pl-6">
            Until {formatDateTime(req.requestedEnd)}
          </p>
        </div>
        {statusBadge(req.status)}
      </div>

      {req.instructorName && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <User className="size-4 shrink-0" />
          Instructor: <span className="text-foreground font-medium">{req.instructorName}</span>
        </p>
      )}

      {canJoin && (
        <>
          <Button
            className="w-full rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30"
            disabled={join.isPending}
            onClick={handleJoin}
          >
            {join.isPending ? (
              <><Loader2 className="size-4 animate-spin" /> Joining…</>
            ) : (
              <><Video className="size-4" /> Join session</>
            )}
          </Button>
          {joinError && (
            <p className="text-xs text-destructive text-center">{joinError}</p>
          )}
        </>
      )}

      {req.status === "pending" && (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 animate-pulse">
            <Skeleton className="size-4 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Join link will be available here once admin approves your request.
          </p>
        </div>
      )}

      {isBeforeJoinWindow && (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 flex items-center gap-2 justify-center">
          <Clock className="size-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground text-center">
            Join link opens at {formatDateTime(new Date(joinOpensAtMs).toISOString())}
          </p>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

type GuardReason = "no_plan" | "no_private_access" | "no_sessions_left" | null;

const GUARD_CONFIG: Record<
  NonNullable<GuardReason>,
  { icon: React.ElementType; color: string; title: string; description: (expiresAt?: string | null) => string; cta: string | null }
> = {
  no_plan: {
    icon: Lock,
    color: "amber",
    title: "Active plan required",
    description: () => "You need an active subscription to request private sessions.",
    cta: "Get a plan",
  },
  no_private_access: {
    icon: ShieldAlert,
    color: "violet",
    title: "Plan upgrade required",
    description: () =>
      "Your current plan doesn't include private 1:1 sessions. Upgrade to Private, Prenatal & Postnatal, or Therapeutic Yoga to unlock them.",
    cta: "Upgrade plan",
  },
  no_sessions_left: {
    icon: BarChart2,
    color: "rose",
    title: "No sessions remaining",
    description: (expiresAt) =>
      expiresAt
        ? `You've used all your sessions for this billing period. They renew on ${new Date(expiresAt).toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`
        : "You've used all your sessions for this billing period.",
    cta: null,
  },
};

const COLOR_CLASSES: Record<string, { border: string; bg: string; iconBg: string; iconText: string }> = {
  amber: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  violet: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600 dark:text-violet-400",
  },
  rose: {
    border: "border-rose-500/20",
    bg: "bg-rose-500/5",
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-600 dark:text-rose-400",
  },
};

function GuardBanner({ reason, expiresAt }: { reason: NonNullable<GuardReason>; expiresAt?: string | null }) {
  const cfg = GUARD_CONFIG[reason];
  const colors = COLOR_CLASSES[cfg.color];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-4 rounded-2xl border ${colors.border} ${colors.bg} px-5 py-4`}>
      <div className={`size-9 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{cfg.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
          {cfg.description(expiresAt)}
        </p>
      </div>
      {cfg.cta && (
        <Button asChild size="sm" className="shrink-0 rounded-xl">
          <Link to="/billing">{cfg.cta}</Link>
        </Button>
      )}
    </div>
  );
}

function PrivateSessionsPage() {
  const { data, isLoading } = useMyPrivateRequests();
  const myPlan = useMyPlan();
  const requests = data?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeSubs = myPlan.data?.data ?? [];
  const planLoading = myPlan.isLoading;

  // A user can hold several active plans at once; only the one that grants
  // private-session access matters for booking eligibility here.
  const privateCapableSub = activeSubs.find((s) => s.plan.allowsPrivate);

  const hasPlan = activeSubs.length > 0;
  const allowsPrivate = privateCapableSub !== undefined;
  const sessionsTotal = privateCapableSub?.sessionsTotal ?? null;
  const sessionsUsed = privateCapableSub?.sessionsUsed ?? 0;
  const hasSessionsLeft = sessionsTotal === null || sessionsUsed < sessionsTotal;

  const guardReason: GuardReason = !hasPlan
    ? "no_plan"
    : !allowsPrivate
      ? "no_private_access"
      : !hasSessionsLeft
        ? "no_sessions_left"
        : null;

  const canRequest = !planLoading && guardReason === null;

  function openDialog() {
    if (!canRequest) return;
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6 px-1">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Private Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Request a 1:1 session — our team will assign an instructor and confirm your booking.
          </p>
        </div>
        <Button
          className="rounded-2xl gap-2 shadow-sm"
          disabled={!canRequest}
          onClick={openDialog}
        >
          <Plus className="size-4" />
          Request session
        </Button>
      </div>

      {!planLoading && guardReason && (
        <GuardBanner reason={guardReason} expiresAt={privateCapableSub?.expiresAt} />
      )}

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center space-y-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <User className="size-6 text-primary" />
          </div>
          <p className="font-semibold text-foreground">No private sessions yet</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Submit a request with your preferred time and we'll match you with an instructor.
          </p>
          <Button
            variant="outline"
            className="rounded-xl mt-2"
            disabled={!canRequest}
            onClick={openDialog}
          >
            <Plus className="size-4 mr-2" />
            Request your first session
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard key={req.id} req={req} />
          ))}
        </div>
      )}

      <BookPrivateSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
