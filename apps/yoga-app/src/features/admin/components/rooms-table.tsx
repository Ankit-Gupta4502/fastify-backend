import type { AdminRoom } from "@yoga-app/shared";
import { cn } from "@/shared/lib/utils";
import { Video, Pencil, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";

interface RoomsTableProps {
  rooms: AdminRoom[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (room: AdminRoom) => void;
  onCancel: (room: AdminRoom) => void;
}

const COLUMNS: DataTableColumn[] = [
  { key: "class", header: "Class" },
  { key: "instructor", header: "Instructor" },
  { key: "starts", header: "Starts (UTC)" },
  { key: "ends", header: "Ends (UTC)" },
  { key: "spots", header: "Spots" },
  { key: "meet", header: "Meet" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions", align: "right" },
];

const STATUS_STYLES: Record<string, string> = {
  idle: "text-sky-600",
  active: "text-emerald-600",
  closed: "text-muted-foreground",
  cancelled: "text-destructive",
};

const STATUS_DOT: Record<string, string> = {
  idle: "bg-sky-500",
  active: "bg-emerald-500",
  closed: "bg-muted-foreground/50",
  cancelled: "bg-destructive",
};

export function RoomsTable({ rooms, isLoading, error, onEdit, onCancel }: RoomsTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      data={rooms}
      isLoading={isLoading}
      loadingRows={4}
      error={error}
      errorMessage="Failed to load rooms."
      emptyMessage="No live sessions scheduled yet."
      getRowKey={(room) => room.id}
      renderCells={(room) => (
        <>
          <TableCell className="font-medium">
            {room.name ?? <span className="text-muted-foreground/50 font-normal">—</span>}
          </TableCell>
          <TableCell className="font-medium">{room.instructorName}</TableCell>
          <TableCell className="text-muted-foreground">
            {new Date(room.scheduledStart).toLocaleString("en-US", {
              timeZone: "UTC",
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {new Date(room.scheduledEnd).toLocaleString("en-US", {
              timeZone: "UTC",
              timeStyle: "short",
            })}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {room.currentOccupancy} / {room.capacity}
          </TableCell>
          <TableCell>
            {room.meetLink ? (
              <a
                href={room.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Video className="size-3.5" />
                Join
              </a>
            ) : (
              <span className="text-xs text-muted-foreground/50">—</span>
            )}
          </TableCell>
          <TableCell>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
                STATUS_STYLES[room.status] ?? "text-muted-foreground",
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATUS_DOT[room.status] ?? "bg-muted-foreground/50")} />
              {room.status}
            </span>
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-end gap-1" title={room.status === "cancelled" ? "This class was cancelled by admin" : undefined}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-lg"
                disabled={room.status === "cancelled"}
                onClick={() => onEdit(room)}
              >
                <Pencil className="size-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-lg text-destructive hover:text-destructive"
                disabled={room.status === "cancelled"}
                onClick={() => onCancel(room)}
              >
                <Ban className="size-3.5" />
                <span className="sr-only">Cancel class</span>
              </Button>
            </div>
          </TableCell>
        </>
      )}
    />
  );
}
