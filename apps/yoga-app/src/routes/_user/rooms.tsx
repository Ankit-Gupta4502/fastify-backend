import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Sparkles, RefreshCw, Search, Users, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUpcomingRooms, useEnrolRoom, useJoinRoom } from "@/hooks/use-rooms";
import { formatCompact, relativeFromNow, userTimezone } from "@/lib/timezone";
import type { UpcomingRoom } from "@yoga-app/shared";

export const Route = createFileRoute("/_user/rooms")({
  component: RoomsPage,
});

type SortKey = "time" | "instructor" | "spots";
type SortDir = "asc" | "desc";

const LIVE_JOIN_WINDOW_MS = 15 * 60 * 1000;

function canJoinLive(room: UpcomingRoom): boolean {
  const now = Date.now();
  const start = new Date(room.scheduledStartUtc).getTime();
  const end = new Date(room.scheduledEndUtc).getTime();
  return now >= start - LIVE_JOIN_WINDOW_MS && now < end;
}

function RoomsPage() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch, error } = useUpcomingRooms();
  const enrol = useEnrolRoom();
  const join = useJoinRoom();
  const tz = userTimezone();

  const [actionId, setActionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rooms = data?.data ?? [];

  const handleEnrol = (roomId: string) => {
    setErrorMessage(null);
    setActionId(roomId);
    enrol.mutate(roomId, {
      onError: (err) => setErrorMessage(err instanceof Error ? err.message : "Could not enrol"),
      onSettled: () => setActionId((c) => (c === roomId ? null : c)),
    });
  };

  const handleJoinLive = (roomId: string) => {
    setErrorMessage(null);
    setActionId(roomId);
    join.mutate(roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId }, search: { code } });
      },
      onError: (err) => {
        setErrorMessage(err instanceof Error ? err.message : "Could not join");
        setActionId(null);
      },
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = q
      ? rooms.filter(
          (r) =>
            r.instructor.name.toLowerCase().includes(q) ||
            r.instructor.specialty.some((s) => s.toLowerCase().includes(q)),
        )
      : rooms;

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "time") cmp = new Date(a.scheduledStartUtc).getTime() - new Date(b.scheduledStartUtc).getTime();
      else if (sortKey === "instructor") cmp = a.instructor.name.localeCompare(b.instructor.name);
      else if (sortKey === "spots") cmp = b.spotsLeft - a.spotsLeft;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [rooms, query, sortKey, sortDir]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Browse upcoming group flows — times shown in your local zone.
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by instructor or style…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 rounded-xl bg-card/50 border-border/60"
        />
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/20">
              <SortTh label="Time" sortKey="time" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortTh label="Instructor" sortKey="instructor" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Specialties</th>
              <SortTh label="Spots" sortKey="spots" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  Could not load sessions. Try refreshing.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Sparkles className="size-8 text-primary/40" />
                    <p className="font-medium">{query ? "No sessions match your search" : "No upcoming sessions"}</p>
                    <p className="text-xs text-muted-foreground">
                      {query ? "Try a different instructor or style" : "Check back soon — new flows are added daily."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((room) => (
                <SessionRow
                  key={room.id}
                  room={room}
                  tz={tz}
                  acting={actionId === room.id}
                  onEnrol={handleEnrol}
                  onJoinLive={handleJoinLive}
                />
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/10">
            {filtered.length} session{filtered.length !== 1 ? "s" : ""}
            {query && rooms.length !== filtered.length && ` of ${rooms.length}`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

interface SortThProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}

function SortTh({ label, sortKey, current, dir, onSort }: SortThProps) {
  const active = current === sortKey;
  return (
    <th
      className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={cn("transition-opacity", active ? "opacity-100" : "opacity-0")}>
          {active && dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </span>
      </span>
    </th>
  );
}

interface SessionRowProps {
  room: UpcomingRoom;
  tz: string;
  acting: boolean;
  onEnrol: (id: string) => void;
  onJoinLive: (id: string) => void;
}

function SessionRow({ room, tz, acting, onEnrol, onJoinLive }: SessionRowProps) {
  const full = room.spotsLeft <= 0 || room.status === "full";
  const live = canJoinLive(room);
  const isActive = room.status === "active";

  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors group">
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="space-y-0.5">
          <div className="font-medium text-foreground">{formatCompact(room.scheduledStartUtc, tz)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {relativeFromNow(room.scheduledStartUtc)}
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5 font-semibold whitespace-nowrap">{room.instructor.name}</td>

      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {room.instructor.specialty.slice(0, 3).map((s) => (
            <Badge key={s} className="bg-primary/10 text-primary border-none px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {s}
            </Badge>
          ))}
        </div>
      </td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5" />
          <span className="text-foreground font-medium">{room.spotsLeft}</span>
          <span className="text-xs">/ {room.capacity}</span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
          isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : full ? "bg-secondary text-muted-foreground"
            : room.isEnrolled ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "bg-primary/10 text-primary",
        )}>
          <span className={cn(
            "size-1.5 rounded-full",
            isActive ? "bg-emerald-500 animate-pulse"
              : full ? "bg-muted-foreground/40"
              : room.isEnrolled ? "bg-blue-500"
              : "bg-primary/40",
          )} />
          {isActive ? "Live" : full ? "Full" : room.isEnrolled ? "Enrolled" : "Upcoming"}
        </span>
      </td>

      <td className="px-4 py-3.5 text-right">
        {room.isEnrolled ? (
          <Button
            size="sm"
            disabled={!live || acting}
            onClick={() => onJoinLive(room.id)}
            className={cn(
              "rounded-full px-5 font-bold",
              live
                ? "opacity-100 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                : "opacity-60 group-hover:opacity-80",
            )}
          >
            {acting ? "Joining…" : live ? "Join Live" : "Enrolled ✓"}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={full || acting}
            onClick={() => onEnrol(room.id)}
            className="rounded-full px-5 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {acting ? "Reserving…" : full ? "Full" : "Reserve"}
          </Button>
        )}
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-4"><Skeleton className="h-4 w-full rounded-lg" /></td>
      ))}
    </tr>
  );
}
