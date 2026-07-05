import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { AdminRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { useAdminGroupRooms, useAdminInstructors } from "@/hooks/use-admin";
import { RoomsTable } from "../-components/rooms-table";
import { RoomFormDialog } from "../-components/room-form-dialog";
import { DeleteRoomDialog } from "../-components/delete-room-dialog";
import { SectionHeader } from "@/components/shared/section-header";

export const Route = createFileRoute("/admin/rooms/")({
  component: AdminRoomsPage,
});

function AdminRoomsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AdminRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<AdminRoom | null>(null);
  const { data: roomsData, isLoading, error } = useAdminGroupRooms();
  const { data: instructorsData } = useAdminInstructors();
  const rooms = roomsData?.data ?? [];
  const instructors = instructorsData?.data ?? [];

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <SectionHeader
          eyebrow="Admin"
          title="Live Rooms"
          description="Schedule upcoming live sessions and assign instructors."
        />
        <Button
          className="rounded-2xl gap-2 shadow-sm"
          onClick={() => {
            setEditingRoom(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New class
        </Button>
      </div>

      <RoomsTable
        rooms={rooms}
        isLoading={isLoading}
        error={error}
        onEdit={(room) => {
          setEditingRoom(room);
          setFormOpen(true);
        }}
        onDelete={(room) => setDeletingRoom(room)}
      />

      <RoomFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        instructors={instructors}
        room={editingRoom}
      />

      <DeleteRoomDialog room={deletingRoom} onOpenChange={(open) => !open && setDeletingRoom(null)} />
    </div>
  );
}
