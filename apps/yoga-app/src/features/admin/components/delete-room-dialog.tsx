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
import { useDeleteGroupRoom } from "@/features/admin/hooks/use-admin";
import { useState } from "react";

interface DeleteRoomDialogProps {
  room: AdminRoom | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoomDialog({ room, onOpenChange }: DeleteRoomDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteRoom = useDeleteGroupRoom();

  const handleOpenChange = (open: boolean) => {
    if (!open) setError(null);
    onOpenChange(open);
  };

  const handleDelete = () => {
    if (!room) return;
    setError(null);
    deleteRoom.mutate(room.id, {
      onSuccess: () => onOpenChange(false),
      onError: (err) => setError(err instanceof Error ? err.message : "Failed to delete class"),
    });
  };

  return (
    <Dialog open={room !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Delete live session?</DialogTitle>
          <DialogDescription>
            {room && `${room.instructorName}'s class on ${new Date(room.scheduledStart).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC will be permanently removed.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-xl bg-destructive/5 border border-destructive/30 text-destructive text-sm px-4 py-3">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={deleteRoom.isPending}
            onClick={handleDelete}
          >
            {deleteRoom.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
