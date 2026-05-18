import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminGroupRooms, useAdminInstructors } from "@/hooks/use-admin";
import { RoomsTable } from "./_components/rooms-table";
import { CreateRoomDialog } from "./_components/create-room-dialog";

export const Route = createFileRoute("/admin/rooms")({
  component: AdminRoomsPage,
});

function AdminRoomsPage() {
  const [open, setOpen] = useState(false);
  const { data: roomsData, isLoading, error } = useAdminGroupRooms();
  const { data: instructorsData } = useAdminInstructors();
  const rooms = roomsData?.data ?? [];
  const instructors = instructorsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
            Admin
          </span>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Group Classes</h1>
          <p className="text-muted-foreground text-sm">Schedule upcoming group sessions and assign instructors.</p>
        </div>
        <Button
          className="rounded-2xl gap-2 shadow-sm"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          New class
        </Button>
      </div>

      <RoomsTable rooms={rooms} isLoading={isLoading} error={error} />

      <CreateRoomDialog
        open={open}
        onOpenChange={setOpen}
        instructors={instructors}
      />
    </div>
  );
}
