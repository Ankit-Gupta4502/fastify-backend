import { useNavigate } from "@tanstack/react-router";
import { Users, Lock, Loader2 } from "lucide-react";
import type { AdminInstructorSession } from "@yoga-app/shared";
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn, TablePagination } from "@/shared/components/tables";
import { cn } from "@/shared/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  full: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  ended: "bg-border/60 text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const t1 = s.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const t2 = e.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${t1} – ${t2}`;
}

const COLUMNS: DataTableColumn[] = [
  { key: "type", header: "Type" },
  { key: "when", header: "When" },
  { key: "status", header: "Status" },
  { key: "occupancy", header: "Occupancy" },
  { key: "attended", header: "Attended" },
];

interface InstructorSessionsSectionProps {
  instructorId: string;
  sessions: AdminInstructorSession[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  isFetching?: boolean;
}

export function InstructorSessionsSection({
  instructorId,
  sessions,
  page,
  pageSize,
  total,
  onPageChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  isFetching = false,
}: InstructorSessionsSectionProps) {
  const navigate = useNavigate();
  const hasDateFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium">From</Label>
          <Input
            type="date"
            className="rounded-xl w-40"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">To</Label>
          <Input
            type="date"
            className="rounded-xl w-40"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
        {hasDateFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onDateFromChange("");
              onDateToChange("");
            }}
          >
            Clear
          </Button>
        )}
        {isFetching && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Updating…
          </span>
        )}
      </div>

      <div className={cn("transition-opacity", isFetching && "opacity-60 pointer-events-none")}>
        <DataTable
          columns={COLUMNS}
          data={sessions}
          getRowKey={(s) => s.id}
          emptyMessage="No sessions yet."
          footer={
            sessions.length > 0 ? (
              <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
            ) : null
          }
          getRowProps={(s) => ({
            className: "cursor-pointer",
            onClick: () =>
              navigate({
                to: "/admin/instructors/$instructorId/sessions/$roomId",
                params: { instructorId, roomId: s.id },
              }),
          })}
          renderCells={(s) => (
            <>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 capitalize">
                  {s.type === "private" ? (
                    <Lock className="size-3.5 text-violet-500" />
                  ) : (
                    <Users className="size-3.5 text-sky-500" />
                  )}
                  {s.type}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatRange(s.scheduledStart, s.scheduledEnd)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[s.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {s.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {s.currentOccupancy}/{s.capacity}
              </TableCell>
              <TableCell className="text-muted-foreground">{s.participantCount}</TableCell>
            </>
          )}
        />
      </div>
    </div>
  );
}
