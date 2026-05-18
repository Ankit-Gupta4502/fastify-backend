import type { AdminRoom } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RoomsTableProps {
  rooms: AdminRoom[];
  isLoading: boolean;
  error: Error | null;
}

const STATUS_STYLES: Record<string, string> = {
  idle: "text-sky-600",
  active: "text-emerald-600",
  closed: "text-muted-foreground",
};

const STATUS_DOT: Record<string, string> = {
  idle: "bg-sky-500",
  active: "bg-emerald-500",
  closed: "bg-muted-foreground/50",
};

export function RoomsTable({ rooms, isLoading, error }: RoomsTableProps) {
  if (error) {
    return (
      <div className="rounded-2xl bg-destructive/5 border border-destructive/30 text-destructive p-6 text-sm">
        Failed to load rooms.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Instructor</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Starts (UTC)</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Ends (UTC)</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Spots</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            : rooms.map((room) => (
                <tr key={room.id} className="hover:bg-secondary/20 transition-colors">
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
                </tr>
              ))}
        </tbody>
      </table>
      {!isLoading && rooms.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">
          No group classes scheduled yet.
        </p>
      )}
    </div>
  );
}
