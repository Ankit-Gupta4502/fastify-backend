import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomCard } from "./_components/rooms/RoomCard";
import { useUpcomingRooms, useJoinRoom } from "@/hooks/use-rooms";

export const Route = createFileRoute("/_user/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch, error } = useUpcomingRooms();
  const join = useJoinRoom();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rooms = data?.data ?? [];

  const handleJoin = (roomId: string) => {
    setErrorMessage(null);
    setJoiningId(roomId);
    join.mutate(roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({
          to: "/session/$roomId",
          params: { roomId },
          search: { code },
        });
      },
      onError: (err) => {
        setErrorMessage(err instanceof Error ? err.message : "Could not join");
        setJoiningId(null);
      },
      onSettled: () => {
        setJoiningId((cur) => (cur === roomId ? null : cur));
      },
    });
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
            Live Sessions
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
            Upcoming <span className="italic text-primary">Group Flows</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Browse live group classes happening soon. Times are shown in your local zone.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? "size-3.5 animate-spin" : "size-3.5"} />
          Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 text-destructive p-4 text-sm">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-destructive/5 text-destructive p-8 text-sm">
          Could not load rooms. Try again.
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-3xl bg-secondary/30 border border-border/40 p-12 text-center space-y-3">
          <Sparkles className="size-8 text-primary/60 mx-auto" />
          <h3 className="text-xl font-bold">No upcoming sessions</h3>
          <p className="text-muted-foreground text-sm">
            Check back soon — instructors schedule new flows daily.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={handleJoin}
              joinPending={joiningId === room.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
