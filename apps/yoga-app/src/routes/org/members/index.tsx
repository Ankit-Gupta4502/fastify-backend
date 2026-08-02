import { createFileRoute } from "@tanstack/react-router";
import { InviteMembersDialog } from "@/features/organization/components/invite-members-dialog";
import { MembersTable } from "@/features/organization/components/members-table";
import { useOrganizationMembers } from "@/features/organization/hooks/use-organization-members";

export const Route = createFileRoute("/org/members/")({
  component: MembersPage,
});

function MembersPage() {
  const { organizationId } = Route.useRouteContext();
  const { data, isLoading, error } = useOrganizationMembers(organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">Invite teammates and track who's joined.</p>
        </div>
        <InviteMembersDialog organizationId={organizationId} />
      </div>

      <MembersTable
        organizationId={organizationId}
        members={data?.data ?? []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
