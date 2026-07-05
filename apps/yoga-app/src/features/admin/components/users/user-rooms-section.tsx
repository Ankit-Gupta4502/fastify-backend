import { Users, Lock } from "lucide-react";
import type { AdminUserRoom } from "@yoga-app/shared";

const STATUS_STYLES: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  full: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  ended: "bg-border/60 text-muted-foreground",
};

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const t1 = s.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const t2 = e.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${t1} – ${t2}`;
}

export function UserRoomsSection({ rooms }: { rooms: AdminUserRoom[] }) {
  if (rooms.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <div key={room.id} className="rounded-xl border border-border/60 bg-card px-4 py-3 flex items-start gap-3">
          <div className={[
            "mt-0.5 size-7 rounded-lg flex items-center justify-center shrink-0",
            room.type === "private" ? "bg-violet-100 dark:bg-violet-500/15" : "bg-sky-100 dark:bg-sky-500/15",
          ].join(" ")}>
            {room.type === "private"
              ? <Lock className="size-3.5 text-violet-600 dark:text-violet-400" />
              : <Users className="size-3.5 text-sky-600 dark:text-sky-400" />}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium capitalize">{room.type} session</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[room.status] ?? "bg-muted text-muted-foreground"}`}>
                {room.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{formatRange(room.scheduledStart, room.scheduledEnd)}</p>
            {room.instructorName && (
              <p className="text-xs text-muted-foreground">
                Instructor: <span className="text-foreground font-medium">{room.instructorName}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
