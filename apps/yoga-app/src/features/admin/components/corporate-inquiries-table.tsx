import type { AdminCorporateInquiry } from "@yoga-app/shared";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { EmptyState } from "@/shared/components/misc/empty-state";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { ContactStatusChip } from "./contact-status-chip";

const columns: DataTableColumn[] = [
  { key: "lead", header: "Lead" }, { key: "company", header: "Company" },
  { key: "team", header: "Team" }, { key: "goal", header: "Wellness goal" },
  { key: "status", header: "Status" }, { key: "received", header: "Received" }, { key: "actions", header: "Actions" },
];

export function CorporateInquiriesTable({ inquiries, isLoading, error, onResolve, isResolving }: {
  inquiries: AdminCorporateInquiry[]; isLoading: boolean; error: Error | null;
  onResolve: (inquiry: AdminCorporateInquiry) => void; isResolving: boolean;
}) {
  return <DataTable columns={columns} data={inquiries} isLoading={isLoading} loadingRows={5} error={error}
    errorMessage="Failed to load corporate inquiries. Please refresh."
    emptyMessage={<EmptyState icon={Building2} title="No corporate inquiries yet" variant="plain" />}
    getRowKey={(inquiry) => inquiry.id}
    renderCells={(inquiry) => <>
      <TableCell><p className="font-medium whitespace-nowrap">{inquiry.name}</p><a className="text-xs text-muted-foreground hover:text-primary" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></TableCell>
      <TableCell><p className="font-medium">{inquiry.companyName}</p>{inquiry.phone && <p className="text-xs text-muted-foreground">{inquiry.phone}</p>}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">{inquiry.teamSize}</TableCell>
      <TableCell className="max-w-75"><p className="line-clamp-2 text-muted-foreground" title={inquiry.wellnessGoal}>{inquiry.wellnessGoal}</p></TableCell>
      <TableCell><ContactStatusChip status={inquiry.status} /></TableCell>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
      <TableCell><Button size="sm" variant="outline" className="rounded-xl text-xs" disabled={inquiry.status === "resolved" || isResolving} onClick={() => onResolve(inquiry)}>{inquiry.status === "resolved" ? "Resolved" : "Mark Resolved"}</Button></TableCell>
    </>}
  />;
}
