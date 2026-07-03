import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useJoinRoom } from "@/hooks/use-rooms";

export function useJoinLiveRoom() {
  const router = useRouter();
  const join = useJoinRoom();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  function handleJoin(roomId: string) {
    setJoinError(null);
    setJoiningId(roomId);
    join.mutate(roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId }, search: { code } });
      },
      onError: (err) => {
        setJoinError(err instanceof Error ? err.message : "Could not open studio");
        setJoiningId(null);
      },
    });
  }

  return { joiningId, joinError, handleJoin };
}
