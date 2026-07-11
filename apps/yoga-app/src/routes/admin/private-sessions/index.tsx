import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { useAdminPrivateRequests, useAssignPrivateRequest, useRejectPrivateRequest, useAdminInstructors } from "@/features/admin/hooks/use-admin";
import type { AdminPrivateSessionRequest, PrivateSessionRequestStatus } from "@yoga-app/shared";

type StatusFilter = "pending" | "approved" | "rejected";

const STATUS_TABS: { value: StatusFilter; label: string; icon: React.ElementType }[] = [
  { value: "pending",  label: "Pending",  icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", icon: XCircle },
];

export const Route = createFileRoute("/admin/private-sessions/")({
  component: AdminPrivateSessionsPage,
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
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

interface RequestRowProps {
  req: AdminPrivateSessionRequest;
  instructors: { id: string; name: string }[];
}

function RequestRow({ req, instructors }: RequestRowProps) {
  const assign = useAssignPrivateRequest();
  const reject = useRejectPrivateRequest();

  const [expanded, setExpanded] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [adminNote, setAdminNote] = useState(req.adminNote ?? "");
  const [actionError, setActionError] = useState<string | null>(null);

  const isPending = req.status === "pending";

  function handleAssign() {
    if (!selectedInstructorId) return;
    setActionError(null);
    assign.mutate(
      { id: req.id, instructorId: selectedInstructorId, adminNote: adminNote || null },
      {
        onError: (err) => setActionError(err instanceof Error ? err.message : "Failed to assign"),
      },
    );
  }

  function handleReject() {
    setActionError(null);
    reject.mutate(
      { id: req.id, adminNote: adminNote || null },
      {
        onError: (err) => setActionError(err instanceof Error ? err.message : "Failed to reject"),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-4 p-4 flex-wrap">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
            <User className="size-4 text-muted-foreground shrink-0" />
            {req.userName}
            <span className="text-xs font-normal text-muted-foreground truncate">{req.userEmail}</span>
          </p>
          {req.preferredSlots && req.preferredSlots.length > 0 ? (
            <div className="pl-6 space-y-0.5">
              {req.preferredSlots.map((slot, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-3 shrink-0 opacity-60" />
                  {formatDateTime(slot.startUtc)} → {formatDateTime(slot.endUtc)}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pl-6 flex items-center gap-2">
              <Calendar className="size-3 shrink-0" />
              {formatDateTime(req.requestedStart)} → {formatDateTime(req.requestedEnd)}
            </p>
          )}
          {req.instructorName && (
            <p className="text-xs text-muted-foreground pl-6">
              Instructor: <span className="text-foreground font-medium">{req.instructorName}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusBadge(req.status)}
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              {expanded ? "Collapse" : "Review"}
            </Button>
          )}
        </div>
      </div>

      {/* Expanded assign/reject panel */}
      {isPending && expanded && (
        <div className="border-t border-border/40 bg-muted/20 px-4 py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Assign instructor</Label>
            <Select value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select an instructor…" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Admin note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="e.g. Instructor confirmed availability, session link will be sent separately…"
              className="rounded-xl resize-none text-sm"
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>

          {actionError && (
            <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
              {actionError}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
              disabled={reject.isPending || assign.isPending}
              onClick={handleReject}
            >
              {reject.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="size-4 mr-1" />
                  Reject
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              disabled={!selectedInstructorId || assign.isPending || reject.isPending}
              onClick={handleAssign}
            >
              {assign.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-1" />
                  Approve &amp; assign
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPrivateSessionsPage() {
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("pending");
  const { data, isLoading, error } = useAdminPrivateRequests(activeStatus);
  const { data: instructorsData } = useAdminInstructors();

  const requests = data?.data ?? [];
  const instructors = (instructorsData?.data ?? [])
    .filter((i) => i.isApproved)
    .map((i) => ({ id: i.id, name: i.name }));

  const emptyMessages: Record<StatusFilter, string> = {
    pending:  "No pending requests",
    approved: "No approved sessions yet",
    rejected: "No rejected requests",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Private Session Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review user requests, assign an instructor, and approve or reject each session.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {STATUS_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveStatus(value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeStatus === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          Failed to load requests. Please refresh and try again.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center space-y-2">
          <p className="font-semibold text-foreground">{emptyMessages[activeStatus]}</p>
          <p className="text-sm text-muted-foreground">
            {activeStatus === "pending"
              ? "Private session requests from users will appear here."
              : `No ${activeStatus} requests to show.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestRow key={req.id} req={req} instructors={instructors} />
          ))}
        </div>
      )}
    </div>
  );
}
