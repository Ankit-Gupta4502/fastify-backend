import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AdminInstructor } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { useApproveInstructor, useUpdateInstructorPriority } from "@/features/admin/hooks/use-admin";
import { CheckCircle2, XCircle, ChevronUp, ChevronDown, Star, PencilLine } from "lucide-react";
import { Chip } from "@/shared/components/misc/chip";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { InstructorStatsDialog } from "@/features/admin/components/instructor-stats-dialog";
import { cn } from "@/shared/lib/utils";
import { relativeFromNow } from "@/shared/lib/timezone";
import { AVAILABILITY_DAYS } from "@/shared/constants";

interface InstructorsTableProps {
  instructors: AdminInstructor[];
  isLoading: boolean;
  error: Error | null;
}

const COLUMNS: DataTableColumn[] = [
  { key: "priority", header: "Priority" },
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status" },
  { key: "approval", header: "Approval" },
  { key: "specialties", header: "Specialties" },
  { key: "availability", header: "Availability" },
  { key: "maxSessions", header: "Max sessions" },
  { key: "rating", header: "Rating" },
  { key: "studentsGuided", header: "Students guided" },
  { key: "actions", header: "" },
];

export function InstructorsTable({ instructors, isLoading, error }: InstructorsTableProps) {
  const navigate = useNavigate();
  const approve = useApproveInstructor();
  const priority = useUpdateInstructorPriority();
  const [statsTarget, setStatsTarget] = useState<AdminInstructor | null>(null);

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
    <>
      <DataTable
        columns={COLUMNS}
        data={instructors}
        isLoading={isLoading}
        loadingRows={4}
        error={error}
        errorMessage="Failed to load instructors."
        emptyMessage={'No instructors yet. Use "Add Instructor" to create one.'}
        getRowKey={(ins) => ins.id}
        getRowProps={(ins) => ({
          className: "cursor-pointer",
          onClick: () =>
            navigate({ to: "/admin/instructors/$instructorId", params: { instructorId: ins.id } }),
        })}
        renderCells={(ins, idx) => {
          const isApprovePending = approve.isPending && approve.variables?.id === ins.id;
          const isPriorityPending = priority.isPending && priority.variables?.id === ins.id;
          return (
            <>
              <TableCell onClick={(e) => e.stopPropagation()}>
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
              </TableCell>

              <TableCell className="font-medium">{ins.name}</TableCell>
              <TableCell className="text-muted-foreground">{ins.email}</TableCell>

              <TableCell>
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
              </TableCell>

              <TableCell>
                {ins.isApproved ? (
                  <Chip variant="success" size="md" icon={CheckCircle2}>Approved</Chip>
                ) : (
                  <Chip variant="warning" size="md" icon={XCircle}>Pending</Chip>
                )}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ins.specialty.length > 0
                    ? ins.specialty.map((s) => (
                        <Chip key={s} variant="muted">{s}</Chip>
                      ))
                    : <span className="text-muted-foreground">—</span>}
                </div>
              </TableCell>

              <TableCell>
                {ins.availability.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {AVAILABILITY_DAYS.filter(({ dow }) =>
                        ins.availability.some((w) => w.dow === dow),
                      ).map(({ dow, short }) => (
                        <Chip key={dow} variant="info">{short}</Chip>
                      ))}
                    </div>
                    {ins.availabilityUpdatedAt && (
                      <p className="text-[10px] text-muted-foreground">
                        Updated {relativeFromNow(ins.availabilityUpdatedAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>

              <TableCell className="text-muted-foreground">{ins.maxConcurrentSessions}</TableCell>

              <TableCell>
                <span className="inline-flex items-center gap-1 text-xs font-medium">
                  <Star className="size-3.5 text-primary fill-primary" />
                  {ins.rating.toFixed(1)}
                </span>
              </TableCell>

              <TableCell className="text-muted-foreground">{ins.studentsGuided}</TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Edit rating / students guided"
                    onClick={() => setStatsTarget(ins)}
                  >
                    <PencilLine className="size-3.5" />
                  </Button>
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
                </div>
              </TableCell>
            </>
          );
        }}
      />

      <InstructorStatsDialog
        instructor={statsTarget}
        open={statsTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatsTarget(null);
        }}
      />
    </>
  );
}
