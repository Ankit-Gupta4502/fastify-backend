import { TableSkeletonRows } from "@/components/shared/TableSkeletonRows";
import { useUpdateWorkshop, useDeleteWorkshop } from "@/hooks/use-workshops";
import type { AdminWorkshop } from "@yoga-app/shared";
import { userTimezone } from "@/lib/timezone";
import { WorkshopRow } from "./WorkshopRow";

interface Props {
  workshops: AdminWorkshop[];
  isLoading: boolean;
  onEdit: (w: AdminWorkshop) => void;
}

export function WorkshopsTable({ workshops, isLoading, onEdit }: Props) {
  const tz = userTimezone();
  const update = useUpdateWorkshop();
  const del = useDeleteWorkshop();

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/20">
              {["Name", "Scheduled", "Price", "Attendees", "Meet link", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={3} cols={6} />
            ) : workshops.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground text-sm">
                  No workshops yet.{" "}
                  <span className="text-foreground font-medium">Create one</span> to show it on the home page.
                </td>
              </tr>
            ) : (
              workshops.map((w) => (
                <WorkshopRow
                  key={w.id}
                  workshop={w}
                  tz={tz}
                  isToggling={update.isPending && update.variables?.id === w.id}
                  isDeleting={del.isPending && del.variables === w.id}
                  onToggle={() =>
                    update.mutate({ id: w.id, body: { isActive: !w.isActive } })
                  }
                  onDelete={() => del.mutate(w.id)}
                  onEdit={() => onEdit(w)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && workshops.length > 0 && (
        <div className="border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/10 flex items-center gap-3">
          <span>{workshops.length} workshop{workshops.length !== 1 ? "s" : ""}</span>
          <span className="h-3 w-px bg-border" />
          <span className="text-emerald-600 font-medium">
            {workshops.filter((w) => w.isActive).length} live
          </span>
          <span className="h-3 w-px bg-border" />
          <span>{workshops.filter((w) => !w.isActive).length} hidden</span>
        </div>
      )}
    </div>
  );
}
