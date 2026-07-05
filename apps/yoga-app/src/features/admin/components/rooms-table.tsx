import type { AdminRoom } from "@yoga-app/shared";
import { cn } from "@/shared/lib/utils";
import { Video, Pencil, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSkeletonRows } from "@/shared/components/misc/table-skeleton-rows";
import { ErrorCard } from "@/shared/components/misc/error-card";

interface RoomsTableProps {
  rooms: AdminRoom[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (room: AdminRoom) => void;
  onCancel: (room: AdminRoom) => void;
}

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
  if (error) return <ErrorCard message="Failed to load rooms." />;

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Class</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Instructor</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Starts (UTC)</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Ends (UTC)</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Spots</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Meet</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading ? (
            <TableSkeletonRows rows={4} cols={8} />
          ) : (
            rooms.map((room) => (
              <tr key={room.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {room.name ?? <span className="text-muted-foreground/50 font-normal">—</span>}
                </td>
                <td className="px-4 py-3 font-medium">{room.instructorName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(room.scheduledStart).toLocaleString("en-US", {
                    timeZone: "UTC",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(room.scheduledEnd).toLocaleString("en-US", {
                    timeZone: "UTC",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {room.currentOccupancy} / {room.capacity}
                </td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
                      STATUS_STYLES[room.status] ?? "text-muted-foreground",
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", STATUS_DOT[room.status] ?? "bg-muted-foreground/50")} />
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {!isLoading && rooms.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">
          No live sessions scheduled yet.
        </p>
      )}
    </div>
  );
}
