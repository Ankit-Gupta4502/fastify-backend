import type { AdminContactQuery } from "@yoga-app/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableSkeletonRows } from "@/shared/components/misc/table-skeleton-rows";
import { ErrorCard } from "@/shared/components/misc/error-card";
import { EmptyState } from "@/shared/components/misc/empty-state";
import { MessageCircle } from "lucide-react";
import { ContactStatusChip } from "./contact-status-chip";

const COLUMNS = ["Name", "Email", "Subject", "Message", "Status", "Received", "Actions"];

interface Props {
  queries: AdminContactQuery[];
  isLoading: boolean;
  error: Error | null;
  onResolve: (query: AdminContactQuery) => void;
  isResolving: boolean;
}

export function ContactQueriesTable({ queries, isLoading, error, onResolve, isResolving }: Props) {
  if (error) return <ErrorCard message="Failed to load contact queries. Please refresh." />;

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
            <TableSkeletonRows rows={5} cols={7} />
          ) : queries.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={7} className="py-0">
                <EmptyState icon={MessageCircle} title="No contact queries yet" variant="plain" />
              </TableCell>
            </TableRow>
          ) : (
            queries.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium whitespace-nowrap">{q.name}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{q.email}</TableCell>
                <TableCell className="text-muted-foreground max-w-[160px] truncate">{q.subject}</TableCell>
                <TableCell className="text-muted-foreground max-w-[280px]">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
