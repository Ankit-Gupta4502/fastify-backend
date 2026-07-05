import type { AdminContactQuery } from "@yoga-app/shared";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/misc/empty-state";
import { MessageCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { ContactStatusChip } from "./contact-status-chip";

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "subject", header: "Subject" },
  { key: "message", header: "Message" },
  { key: "status", header: "Status" },
  { key: "received", header: "Received" },
  { key: "actions", header: "Actions" },
];

interface Props {
  queries: AdminContactQuery[];
  isLoading: boolean;
  error: Error | null;
  onResolve: (query: AdminContactQuery) => void;
  isResolving: boolean;
}

export function ContactQueriesTable({ queries, isLoading, error, onResolve, isResolving }: Props) {
  return (
    <DataTable
      columns={COLUMNS}
      data={queries}
      isLoading={isLoading}
      loadingRows={5}
      error={error}
      errorMessage="Failed to load contact queries. Please refresh."
      emptyMessage={<EmptyState icon={MessageCircle} title="No contact queries yet" variant="plain" />}
      getRowKey={(q) => q.id}
      renderCells={(q) => (
        <>
          <TableCell className="font-medium whitespace-nowrap">{q.name}</TableCell>
          <TableCell className="text-muted-foreground whitespace-nowrap">{q.email}</TableCell>
          <TableCell className="text-muted-foreground max-w-40 truncate">{q.subject}</TableCell>
          <TableCell className="text-muted-foreground max-w-70">
            <p className="line-clamp-2" title={q.message}>
              {q.message}
            </p>
          </TableCell>
          <TableCell>
            <ContactStatusChip status={q.status} />
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
            {new Date(q.createdAt).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs"
              disabled={q.status === "resolved" || isResolving}
              onClick={() => onResolve(q)}
            >
              {q.status === "resolved" ? "Resolved" : "Mark Resolved"}
            </Button>
          </TableCell>
        </>
      )}
    />
  );
}
