import { Loader2, Tag, Ticket } from "lucide-react";
import type { AdminOrganizationSummary } from "@/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { useSetOrganizationBillingApproval } from "@/features/admin/hooks/use-admin";

interface OrganizationsTableProps {
  organizations: AdminOrganizationSummary[];
  isLoading: boolean;
  error: Error | null;
  onSetPricing: (organization: AdminOrganizationSummary) => void;
  onSetCoupon: (organization: AdminOrganizationSummary) => void;
}

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Organization" },
  { key: "size", header: "Size" },
  { key: "members", header: "Members" },
  { key: "pricing", header: "Per-seat price" },
  { key: "billing", header: "Billing" },
  { key: "actions", header: "Actions", align: "right" },
];

function formatMoney(cents: number | null, symbol: string): string {
  if (cents == null) return "—";
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

export function OrganizationsTable({
  organizations,
  isLoading,
  error,
  onSetPricing,
  onSetCoupon,
}: OrganizationsTableProps) {
  const setBillingApproval = useSetOrganizationBillingApproval();

  return (
    <DataTable
      columns={COLUMNS}
      data={organizations}
      isLoading={isLoading}
      loadingRows={4}
      error={error}
      errorMessage="Failed to load organizations."
      emptyMessage="No organizations have signed up yet."
      getRowKey={(organization) => organization.id}
      renderCells={(organization) => {
        const isApproved = organization.billingApprovedAt !== null;
        const isToggling =
          setBillingApproval.isPending && setBillingApproval.variables?.id === organization.id;

        return (
          <>
            <TableCell className="font-medium">{organization.name}</TableCell>
            <TableCell className="text-muted-foreground">{organization.sizeBand}</TableCell>
            <TableCell className="text-muted-foreground">{organization.memberCount}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatMoney(organization.pricePerSeatCents, "$")} / {formatMoney(organization.pricePerSeatInrPaise, "₹")}
            </TableCell>
            <TableCell>
              <Badge variant={isApproved ? "default" : "secondary"}>
                {isApproved ? "Approved" : "Pending"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  title="Set per-seat price"
                  onClick={() => onSetPricing(organization)}
                >
                  <Tag className="size-3.5" />
                  <span className="sr-only">Set per-seat price</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  title="Set self-pay coupon"
                  onClick={() => onSetCoupon(organization)}
                >
                  <Ticket className="size-3.5" />
                  <span className="sr-only">Set self-pay coupon</span>
                </Button>
                <Button
                  type="button"
                  variant={isApproved ? "outline" : "default"}
                  size="sm"
                  className="rounded-full text-xs"
                  disabled={isToggling}
                  onClick={() =>
                    setBillingApproval.mutate({ id: organization.id, approved: !isApproved })
                  }
                >
                  {isToggling ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : isApproved ? (
                    "Revoke"
                  ) : (
                    "Approve"
                  )}
                </Button>
              </div>
            </TableCell>
          </>
        );
      }}
    />
  );
}
