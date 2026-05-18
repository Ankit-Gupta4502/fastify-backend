import { createFileRoute } from "@tanstack/react-router";
import { useAdminUsers } from "@/hooks/use-admin";
import { UsersTable } from "./_components/users-table";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { data, isLoading, error } = useAdminUsers();
  const users = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
          Admin
        </span>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">All registered accounts.</p>
      </div>
      <UsersTable users={users} isLoading={isLoading} error={error} />
    </div>
  );
}
