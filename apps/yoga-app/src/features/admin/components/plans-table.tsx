import type { AdminPlan } from "@/api/admin";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { Pencil } from "lucide-react";

interface PlansTableProps {
  plans: AdminPlan[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (plan: AdminPlan) => void;
}

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "category", header: "Category" },
  { key: "billing", header: "Billing" },
  { key: "sessions", header: "Sessions" },
  { key: "priceUsd", header: "Price (USD)" },
  { key: "priceInr", header: "Price (INR)" },
  { key: "actions", header: "Actions", align: "right" },
];

function formatMoney(cents: number | null, symbol: string, divisor: number): string {
  if (cents == null) return "—";
  return `${symbol}${(cents / divisor).toFixed(2)}`;
}

export function PlansTable({ plans, isLoading, error, onEdit }: PlansTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      data={plans}
      isLoading={isLoading}
      loadingRows={4}
      error={error}
      errorMessage="Failed to load plans."
      emptyMessage="No plans yet."
      getRowKey={(plan) => plan.id}
      renderCells={(plan) => (
        <>
          <TableCell className="font-medium">{plan.name}</TableCell>
          <TableCell className="text-muted-foreground">{plan.category}</TableCell>
          <TableCell className="text-muted-foreground capitalize">{plan.billingInterval}</TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {plan.sessionsPerWeek != null
              ? `${plan.sessionsPerWeek}/week`
              : plan.sessionsPerMonth != null
                ? `${plan.sessionsPerMonth}/month`
                : "—"}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {formatMoney(plan.priceCents ?? plan.pricePerSessionCents, "$", 100)}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {formatMoney(plan.priceInrPaise ?? plan.pricePerSessionInrPaise, "₹", 100)}
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-end">
              <Button type="button" variant="ghost" size="icon-sm" className="rounded-lg" onClick={() => onEdit(plan)}>
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
