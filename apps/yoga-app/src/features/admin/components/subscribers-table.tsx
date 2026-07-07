import type { AdminUser, PlanRecord } from "@yoga-app/shared";
import { Chip } from "@/shared/components/misc/chip";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { getPlanLabel, getPlanPriceCents } from "@/features/payments/utils/plan-copy";
import { centsToDisplay } from "@/shared/lib/utils";
import { SubscriptionStatusChip } from "@/features/admin/components/subscription-status-chip";

interface SubscribersTableProps {
  users: AdminUser[];
  plans: PlanRecord[];
  isLoading: boolean;
}

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "plan", header: "Plan" },
  { key: "status", header: "Status" },
  { key: "price", header: "Price / mo" },
  { key: "joined", header: "Joined" },
];

export function SubscribersTable({ users, plans, isLoading }: SubscribersTableProps) {
  const subscribers = users.filter((u) => u.planName !== null && u.role === "user");

  return (
    <DataTable
      columns={COLUMNS}
      data={subscribers}
      isLoading={isLoading}
      loadingRows={5}
      emptyMessage="No subscribers yet."
      getRowKey={(u) => u.id}
      renderCells={(u) => {
        const priceCents = getPlanPriceCents(u.planName!, plans);
        return (
          <>
            <TableCell className="font-medium">{u.name}</TableCell>
            <TableCell className="text-muted-foreground">{u.email}</TableCell>
            <TableCell>
              <Chip variant="primary" size="sm">
                {getPlanLabel(u.planName!)}
              </Chip>
            </TableCell>
            <TableCell>{u.status && <SubscriptionStatusChip status={u.status} />}</TableCell>
            <TableCell className="font-medium">
              {priceCents ? centsToDisplay(priceCents) : "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(u.createdAt).toLocaleDateString()}
            </TableCell>
          </>
        );
      }}
    />
  );
}
