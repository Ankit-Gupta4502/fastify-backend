import type { OrganizationMember } from "@/api";
import { cn } from "@/shared/lib/utils";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { PromoteMemberButton } from "@/features/organization/components/promote-member-button";
import { RemoveMemberButton } from "@/features/organization/components/remove-member-button";

interface MembersTableProps {
  organizationId: string;
  members: OrganizationMember[];
  isLoading: boolean;
  error: Error | null;
}

const COLUMNS: DataTableColumn[] = [
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
  { key: "seat", header: "Seat" },
  { key: "joined", header: "Joined" },
  { key: "actions", header: "Actions", align: "right" },
];

const STATUS_STYLES: Record<string, string> = {
  invited: "text-amber-600",
  joined: "text-emerald-600",
  removed: "text-muted-foreground",
};

export function MembersTable({ organizationId, members, isLoading, error }: MembersTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      data={members}
      isLoading={isLoading}
      loadingRows={4}
      error={error}
      errorMessage="Failed to load members."
      emptyMessage="No members yet — invite your first teammate above."
      getRowKey={(member) => member.id}
      renderCells={(member) => (
        <>
          <TableCell className="font-medium">{member.invitedEmail}</TableCell>
          <TableCell className="capitalize text-muted-foreground">{member.role}</TableCell>
          <TableCell>
            <span className={cn("text-xs font-semibold uppercase tracking-wide", STATUS_STYLES[member.status])}>
              {member.status}
            </span>
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {member.sponsoredUserSubscriptionId ? "Sponsored" : "Self-pay"}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {member.joinedAt
              ? new Date(member.joinedAt).toLocaleDateString(undefined, { dateStyle: "medium" })
              : "—"}
          </TableCell>
          <TableCell>
            {member.status === "joined" && (
              <div className="flex items-center justify-end gap-1">
                {member.role !== "admin" && (
                  <PromoteMemberButton organizationId={organizationId} memberId={member.id} />
                )}
                <RemoveMemberButton
                  organizationId={organizationId}
                  memberId={member.id}
                  memberEmail={member.invitedEmail}
                />
              </div>
            )}
          </TableCell>
        </>
      )}
    />
  );
}
