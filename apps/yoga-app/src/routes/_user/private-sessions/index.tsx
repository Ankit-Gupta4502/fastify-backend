import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Clock, CheckCircle2, XCircle, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPrivateRequests } from "@/hooks/use-rooms";
import { BookPrivateSessionDialog } from "../-components/dashboard/BookPrivateSessionDialog";
import type { MyPrivateSessionRequest, PrivateSessionRequestStatus } from "@yoga-app/shared";

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

function RequestCard({ req }: { req: MyPrivateSessionRequest }) {
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

      {req.adminNote && (
        <p className="text-sm text-muted-foreground italic bg-muted/40 rounded-xl px-3 py-2">
          Note: {req.adminNote}
        </p>
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

function PrivateSessionsPage() {
  const { data, isLoading } = useMyPrivateRequests();
  const requests = data?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 px-1">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Private Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Request a 1:1 session — our team will assign an instructor and confirm your booking.
          </p>
        </div>
        <Button className="rounded-2xl gap-2 shadow-sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Request session
        </Button>
      </div>

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
            onClick={() => setDialogOpen(true)}
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

      <BookPrivateSessionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
      />
    </div>
  );
}
