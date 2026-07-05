import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useJoinRoom } from "@/hooks/use-rooms";

interface JoinableRoom {
  id: string;
  meetLink: string | null;
}

export function useJoinLiveRoom() {
  const router = useRouter();
  const join = useJoinRoom();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Group classes join via Google Meet; only private/specialised sessions
  // use the in-app 100ms studio.
  function handleJoin(room: JoinableRoom) {
    setJoinError(null);
    setJoiningId(room.id);
    join.mutate(room.id, {
      onSuccess: (result) => {
        if (room.meetLink) {
          window.open(room.meetLink, "_blank", "noopener,noreferrer");
          setJoiningId(null);
          return;
        }
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId: room.id }, search: { code } });
      },
      onError: (err) => {
        setJoinError(err instanceof Error ? err.message : "Could not open studio");
        setJoiningId(null);
      },
    });
  }

  return { joiningId, joinError, handleJoin };
}
