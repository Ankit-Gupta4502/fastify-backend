import { useNavigate } from "@tanstack/react-router";
import { Users, Lock } from "lucide-react";
import type { AdminInstructorSession } from "@yoga-app/shared";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";

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
}

export function InstructorSessionsSection({ instructorId, sessions }: InstructorSessionsSectionProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      columns={COLUMNS}
      data={sessions}
      getRowKey={(s) => s.id}
      emptyMessage="No sessions yet."
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
  );
}
