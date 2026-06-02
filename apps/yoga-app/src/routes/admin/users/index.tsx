import { createFileRoute } from "@tanstack/react-router";
import { useAdminUsers } from "@/hooks/use-admin";
import { UsersTable } from "../-components/users-table";
import { SectionHeader } from "@/components/shared/section-header";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { data, isLoading, error } = useAdminUsers();
  const users = data?.data ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Admin" title="Users" description="All registered accounts." />
      <UsersTable users={users} isLoading={isLoading} error={error} />
    </div>
  );
}
