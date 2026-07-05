import { useUpdateWorkshop, useDeleteWorkshop } from "@/features/workshops/hooks/use-workshops";
import type { AdminWorkshop } from "@yoga-app/shared";
import { userTimezone } from "@/shared/lib/timezone";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { WorkshopRow } from "./workshop-row";

interface Props {
  workshops: AdminWorkshop[];
  isLoading: boolean;
  onEdit: (w: AdminWorkshop) => void;
}

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "scheduled", header: "Scheduled" },
  { key: "price", header: "Price" },
  { key: "attendees", header: "Attendees" },
  { key: "meetLink", header: "Meet link" },
  { key: "status", header: "Status" },
  { key: "actions", header: "" },
];

export function WorkshopsTable({ workshops, isLoading, onEdit }: Props) {
  const tz = userTimezone();
  const update = useUpdateWorkshop();
  const del = useDeleteWorkshop();

  return (
    <DataTable
      className="bg-card/50"
      columns={COLUMNS}
      data={workshops}
      isLoading={isLoading}
      loadingRows={3}
      emptyMessage={
        <p className="px-4 py-14 text-center text-muted-foreground text-sm">
          No workshops yet. <span className="text-foreground font-medium">Create one</span> to show it on the home page.
        </p>
      }
      getRowKey={(w) => w.id}
      getRowProps={() => ({ className: "group" })}
      renderCells={(w) => (
        <WorkshopRow
          workshop={w}
          tz={tz}
          isToggling={update.isPending && update.variables?.id === w.id}
          isDeleting={del.isPending && del.variables === w.id}
          onToggle={() => update.mutate({ id: w.id, body: { isActive: !w.isActive } })}
          onDelete={() => del.mutate(w.id)}
          onEdit={() => onEdit(w)}
        />
      )}
      footer={
        !isLoading && workshops.length > 0 ? (
          <div className="border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/10 flex items-center gap-3">
            <span>{workshops.length} workshop{workshops.length !== 1 ? "s" : ""}</span>
            <span className="h-3 w-px bg-border" />
            <span className="text-emerald-600 font-medium">
              {workshops.filter((w) => w.isActive).length} live
            </span>
            <span className="h-3 w-px bg-border" />
            <span>{workshops.filter((w) => !w.isActive).length} hidden</span>
          </div>
        ) : null
      }
    />
  );
}
