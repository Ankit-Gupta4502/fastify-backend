import type { AdminDemoRequest } from "@yoga-app/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableSkeletonRows } from "@/components/shared/TableSkeletonRows";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClipboardList } from "lucide-react";
import { DemoStatusChip } from "./DemoStatusChip";

const COLUMNS = [
  "User",
  "Phone",
  "Gender",
  "Goals",
  "Preferred Time",
  "IST Time",
  "Status",
  "Actions",
];

interface Props {
  requests: AdminDemoRequest[];
  isLoading: boolean;
  error: Error | null;
  onReview: (request: AdminDemoRequest) => void;
}

export function DemoRequestsTable({ requests, isLoading, error, onReview }: Props) {
  if (error) return <ErrorCard message="Failed to load demo requests. Please refresh." />;

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40 border-b border-border/40">
          <TableRow className="hover:bg-transparent border-none">
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows rows={5} cols={8} />
          ) : requests.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={8} className="py-0">
                <EmptyState
                  icon={ClipboardList}
                  title="No demo requests yet"
                  variant="plain"
                />
              </TableCell>
            </TableRow>
          ) : (
            requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <div>{r.userName}</div>
                  <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {r.phone}
                </TableCell>
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
                      <span className="text-xs text-muted-foreground">
                        +{r.purposes.length - 2}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  <div>{r.preferredDate}</div>
                  <div className="text-xs">{r.preferredTime}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                  {r.istTime}
                </TableCell>
                <TableCell>
                  <DemoStatusChip status={r.status} />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs"
                    onClick={() => onReview(r)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
