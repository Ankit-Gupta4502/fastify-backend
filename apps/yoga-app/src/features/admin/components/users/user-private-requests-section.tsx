import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import type { AdminUserPrivateRequest } from "@yoga-app/shared";

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <CheckCircle2 className="size-3" />Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
      <XCircle className="size-3" />Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <Clock className="size-3" />Pending
    </span>
  );
}

function formatSlot(startUtc: string, endUtc: string) {
  const s = new Date(startUtc);
  const e = new Date(endUtc);
  return `${s.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${s.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – ${e.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export function UserPrivateRequestsSection({ requests }: { requests: AdminUserPrivateRequest[] }) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground">No private session requests.</p>;
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const slots = req.preferredSlots.length > 0 ? req.preferredSlots : [{ startUtc: req.requestedStart, endUtc: req.requestedEnd }];
        return (
          <div key={req.id} className="rounded-xl border border-border/60 bg-card p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Requested {new Date(req.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
                {req.instructorName && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assigned to: <span className="text-foreground font-medium">{req.instructorName}</span>
                  </p>
                )}
              </div>
              <StatusBadge status={req.status} />
            </div>

            <div className="space-y-1">
              {slots.map((slot, i) => (
                <p key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3 shrink-0 opacity-60" />
                  {formatSlot(slot.startUtc, slot.endUtc)}
                </p>
              ))}
            </div>

            {req.adminNote && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <span className="font-semibold text-foreground">Admin note:</span> {req.adminNote}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
