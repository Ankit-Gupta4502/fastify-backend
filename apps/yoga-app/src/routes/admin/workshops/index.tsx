import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminWorkshops } from "@/hooks/use-workshops";
import { WorkshopsTable } from "../-components/workshops-table";
import { WorkshopDialog } from "../-components/workshop-dialog";
import type { AdminWorkshop } from "@yoga-app/shared";

export const Route = createFileRoute("/admin/workshops/")({
  component: AdminWorkshopsPage,
});

function AdminWorkshopsPage() {
  const { data, isLoading, error } = useAdminWorkshops();
  const workshops = data?.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminWorkshop | null>(null);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (w: AdminWorkshop) => { setEditing(w); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Workshops</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage live workshops shown on the home page.
          </p>
        </div>
        <Button className="rounded-2xl gap-2 shadow-sm" onClick={openCreate}>
          <Plus className="size-4" />
          New workshop
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          Failed to load workshops. Please refresh and try again.
        </div>
      )}

      <WorkshopsTable
        workshops={workshops}
        isLoading={isLoading}
        onEdit={openEdit}
      />

      {dialogOpen && (
        <WorkshopDialog initial={editing} onClose={closeDialog} />
      )}
    </div>
  );
}
