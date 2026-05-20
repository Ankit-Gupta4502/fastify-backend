import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminGroupRooms, useAdminInstructors } from "@/hooks/use-admin";
import { RoomsTable } from "./_components/rooms-table";
import { CreateRoomDialog } from "./_components/create-room-dialog";
import { SectionHeader } from "@/components/shared/section-header";

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
        <SectionHeader
          eyebrow="Admin"
          title="Group Classes"
          description="Schedule upcoming group sessions and assign instructors."
        />
        <Button className="rounded-2xl gap-2 shadow-sm" onClick={() => setOpen(true)}>
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
