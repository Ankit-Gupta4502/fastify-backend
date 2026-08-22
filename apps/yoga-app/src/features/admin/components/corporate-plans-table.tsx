import type { AdminCorporatePlan } from "@/api/admin";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { Pencil } from "lucide-react";

interface CorporatePlansTableProps {
  corporatePlans: AdminCorporatePlan[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (corporatePlan: AdminCorporatePlan) => void;
}

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "linkedPlan", header: "Linked plan" },
  { key: "billing", header: "Billing" },
  { key: "actions", header: "Actions", align: "right" },
];

export function CorporatePlansTable({ corporatePlans, isLoading, error, onEdit }: CorporatePlansTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      data={corporatePlans}
      isLoading={isLoading}
      loadingRows={3}
      error={error}
      errorMessage="Failed to load corporate plans."
      emptyMessage="No corporate plans yet — create one to let orgs buy seats."
      getRowKey={(corporatePlan) => corporatePlan.id}
      renderCells={(corporatePlan) => (
        <>
          <TableCell className="font-medium">{corporatePlan.name}</TableCell>
          <TableCell className="text-muted-foreground">{corporatePlan.linkedPlanName}</TableCell>
          <TableCell className="text-muted-foreground capitalize">{corporatePlan.billingInterval}</TableCell>
          <TableCell>
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-lg"
                onClick={() => onEdit(corporatePlan)}
              >
                <Pencil className="size-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
          </TableCell>
        </>
      )}
    />
  );
}
