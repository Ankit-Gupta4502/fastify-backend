import type { AdminDemoRequest, DemoRequestStatus } from "@yoga-app/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  requests: AdminDemoRequest[];
  isLoading: boolean;
  error: Error | null;
  onReview: (request: AdminDemoRequest) => void;
}

const STATUS_STYLES: Record<DemoRequestStatus, string> = {
  pending:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  approved:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  rejected:
    "bg-destructive/10 text-destructive border-destructive/20",
  needs_information:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  instructor_assigned:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  meeting_scheduled:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  completed:
    "bg-muted/60 text-muted-foreground border-muted",
};

const STATUS_LABELS: Record<DemoRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  needs_information: "Needs Info",
  instructor_assigned: "Assigned",
  meeting_scheduled: "Scheduled",
  completed: "Completed",
};

export function DemoRequestsTable({ requests, isLoading, error, onReview }: Props) {
  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-sm text-destructive">
        Failed to load demo requests. Please refresh.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border/40">
            <TableHead />
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        No demo requests yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b border-border/40">
          <TableHead />
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                <div>{r.userName}</div>
                <div className="text-xs text-muted-foreground">{r.userEmail}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {r.phone}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.gender}</td>
              <td className="px-4 py-3 max-w-[180px]">
                <div className="flex flex-wrap gap-1">
                  {r.purposes.slice(0, 2).map((p) => (
                    <span
                      key={p}
                      className="inline-block rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5"
                    >
                      {p}
                    </span>
                  ))}
                  {r.purposes.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{r.purposes.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                <div>{r.preferredDate}</div>
                <div className="text-xs">{r.preferredTime}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                {r.istTime}
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 whitespace-nowrap",
                    STATUS_STYLES[r.status],
                  )}
                >
                  {STATUS_LABELS[r.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs"
                  onClick={() => onReview(r)}
                >
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHead() {
  const cols = [
    "User",
    "Phone",
    "Gender",
    "Goals",
    "Preferred Time",
    "IST Time",
    "Status",
    "Actions",
  ];
  return (
    <tr>
      {cols.map((c) => (
        <th
          key={c}
          className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap"
        >
          {c}
        </th>
      ))}
    </tr>
  );
}
