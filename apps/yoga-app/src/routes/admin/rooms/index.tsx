import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { AdminRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import {
  useAdminGroupRooms,
  useAdminInstructors,
  useAdminOrganizations,
} from "@/features/admin/hooks/use-admin";
import { RoomsTable } from "@/features/admin/components/rooms-table";
import { RoomFormDialog } from "@/features/admin/components/room-form-dialog";
import { CancelRoomDialog } from "@/features/admin/components/cancel-room-dialog";
import { SectionHeader } from "@/shared/components/misc/section-header";

export const Route = createFileRoute("/admin/rooms/")({
  component: AdminRoomsPage,
});

function AdminRoomsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AdminRoom | null>(null);
  const [cancellingRoom, setCancellingRoom] = useState<AdminRoom | null>(null);
  const { data: roomsData, isLoading, error } = useAdminGroupRooms();
  const { data: instructorsData } = useAdminInstructors();
  const { data: organizationsData } = useAdminOrganizations();
  const rooms = roomsData?.data ?? [];
  const instructors = instructorsData?.data ?? [];
  const organizations = organizationsData?.data ?? [];

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
        organizations={organizations}
        isLoading={isLoading}
        error={error}
        onEdit={(room) => {
          setEditingRoom(room);
          setFormOpen(true);
        }}
        onCancel={(room) => setCancellingRoom(room)}
      />

      <RoomFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        instructors={instructors}
        organizations={organizations}
        room={editingRoom}
      />

      <CancelRoomDialog room={cancellingRoom} onOpenChange={(open) => !open && setCancellingRoom(null)} />
    </div>
  );
}
