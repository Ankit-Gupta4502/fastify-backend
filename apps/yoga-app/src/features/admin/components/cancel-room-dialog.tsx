import type { AdminRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCancelGroupRoom } from "@/features/admin/hooks/use-admin";
import { useState } from "react";

interface CancelRoomDialogProps {
  room: AdminRoom | null;
  onOpenChange: (open: boolean) => void;
}

export function CancelRoomDialog({ room, onOpenChange }: CancelRoomDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const cancelRoom = useCancelGroupRoom();

  const handleOpenChange = (open: boolean) => {
    if (!open) setError(null);
    onOpenChange(open);
  };

  const handleCancel = () => {
    if (!room) return;
    setError(null);
    cancelRoom.mutate(room.id, {
      onSuccess: () => onOpenChange(false),
      onError: (err) => setError(err instanceof Error ? err.message : "Failed to cancel class"),
    });
  };

  return (
    <Dialog open={room !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cancel live session?</DialogTitle>
          <DialogDescription>
            {room &&
              `${room.instructorName}'s class on ${new Date(room.scheduledStart).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC will be cancelled. It will no longer be shown to other users, but the instructor and anyone already enrolled will still see it marked as cancelled by admin.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-xl bg-destructive/5 border border-destructive/30 text-destructive text-sm px-4 py-3">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Keep class
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={cancelRoom.isPending}
            onClick={handleCancel}
          >
            {cancelRoom.isPending ? "Cancelling…" : "Cancel class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
