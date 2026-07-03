import type { AdminInstructor } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { useApproveInstructor, useUpdateInstructorPriority } from "@/hooks/use-admin";
import { CheckCircle2, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Chip } from "@/components/shared/Chip";
import { TableSkeletonRows } from "@/components/shared/TableSkeletonRows";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { cn } from "@/lib/utils";

interface InstructorsTableProps {
  instructors: AdminInstructor[];
  isLoading: boolean;
  error: Error | null;
}

export function InstructorsTable({ instructors, isLoading, error }: InstructorsTableProps) {
  const approve = useApproveInstructor();
  const priority = useUpdateInstructorPriority();

  if (error) return <ErrorCard message="Failed to load instructors." />;

  function movePriority(ins: AdminInstructor, direction: "up" | "down") {
    const sorted = [...instructors].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    const idx = sorted.findIndex((i) => i.id === ins.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Use index positions as sort values to guarantee a distinct swap even when values are equal
    priority.mutate({ id: ins.id, sortOrder: swapIdx });
    priority.mutate({ id: sorted[swapIdx].id, sortOrder: idx });
  }

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Priority</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Approval</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Specialties</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Max sessions</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading ? (
            <TableSkeletonRows rows={4} cols={8} />
          ) : (
            instructors.map((ins, idx) => {
              const isApprovePending = approve.isPending && approve.variables?.id === ins.id;
              const isPriorityPending = priority.isPending && priority.variables?.id === ins.id;
              return (
                <tr key={ins.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={idx === 0 || isPriorityPending}
                        onClick={() => movePriority(ins, "up")}
                        title="Move up"
                      >
                        <ChevronUp className="size-3.5 text-muted-foreground" />
                      </button>
                      <span className="w-6 text-center text-xs text-muted-foreground font-mono">{ins.sortOrder}</span>
                      <button
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={idx === instructors.length - 1 || isPriorityPending}
                        onClick={() => movePriority(ins, "down")}
                        title="Move down"
                      >
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium">{ins.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ins.email}</td>

                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
                        ins.status === "available" ? "text-emerald-600" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          ins.status === "available" ? "bg-emerald-500" : "bg-muted-foreground/50",
                        )}
                      />
                      {ins.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {ins.isApproved ? (
                      <Chip variant="success" size="md" icon={CheckCircle2}>Approved</Chip>
                    ) : (
                      <Chip variant="warning" size="md" icon={XCircle}>Pending</Chip>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {ins.specialty.length > 0
                        ? ins.specialty.map((s) => (
                            <Chip key={s} variant="muted">{s}</Chip>
                          ))
                        : <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">{ins.maxConcurrentSessions}</td>

                  <td className="px-4 py-3 text-right">
                    {ins.isApproved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isApprovePending}
                        onClick={() => approve.mutate({ id: ins.id, approve: false })}
                      >
                        <XCircle className="size-3.5" />
                        {isApprovePending ? "Revoking…" : "Revoke"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-full text-xs gap-1.5"
                        disabled={isApprovePending}
                        onClick={() => approve.mutate({ id: ins.id, approve: true })}
                      >
                        <CheckCircle2 className="size-3.5" />
                        {isApprovePending ? "Approving…" : "Approve"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {!isLoading && instructors.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">No instructors yet. Use "Add Instructor" to create one.</p>
      )}
    </div>
  );
}
