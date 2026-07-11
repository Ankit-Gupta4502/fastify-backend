import type { AdminDemoRequest } from "@yoga-app/shared";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/misc/empty-state";
import { ClipboardList } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { DemoStatusChip } from "./demo-status-chip";

const COLUMNS: DataTableColumn[] = [
  { key: "user", header: "User" },
  { key: "phone", header: "Phone" },
  { key: "gender", header: "Gender" },
  { key: "goals", header: "Goals" },
  { key: "preferredTime", header: "Preferred Time" },
  { key: "istTime", header: "IST Time" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions" },
];

interface Props {
  requests: AdminDemoRequest[];
  isLoading: boolean;
  error: Error | null;
  onReview: (request: AdminDemoRequest) => void;
}

export function DemoRequestsTable({ requests, isLoading, error, onReview }: Props) {
  return (
    <DataTable
      columns={COLUMNS}
      data={requests}
      isLoading={isLoading}
      loadingRows={5}
      error={error}
      errorMessage="Failed to load demo requests. Please refresh."
      emptyMessage={<EmptyState icon={ClipboardList} title="No demo requests yet" variant="plain" />}
      getRowKey={(r) => r.id}
      renderCells={(r) => (
        <>
          <TableCell className="font-medium whitespace-nowrap">
            <div>{r.userName}</div>
            <div className="text-xs text-muted-foreground">{r.userEmail}</div>
          </TableCell>
          <TableCell className="text-muted-foreground whitespace-nowrap">{r.phone}</TableCell>
          <TableCell className="text-muted-foreground">{r.gender}</TableCell>
          <TableCell className="max-w-[180px]">
            <div className="flex flex-wrap gap-1">
              {r.purposes.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="inline-block rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5"
                >
                  {p}
                </span>
              ))}
              {r.purposes.length > 2 && (
                <span className="text-xs text-muted-foreground">+{r.purposes.length - 2}</span>
              )}
            </div>
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            <div>{r.preferredDate}</div>
            <div className="text-xs">{r.preferredTime}</div>
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground text-xs">{r.istTime}</TableCell>
          <TableCell>
            <DemoStatusChip status={r.status} />
          </TableCell>
          <TableCell>
            <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => onReview(r)}>
              Review
            </Button>
          </TableCell>
        </>
      )}
    />
  );
}
