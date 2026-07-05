import { createFileRoute } from "@tanstack/react-router";
import { useAdminUsers, useUsersFilters } from "@/features/admin/hooks";
import { UsersTable } from "@/features/admin/components/users-table";
import { UsersFilterBar } from "@/features/admin/components/users";
import { SectionHeader } from "@/shared/components/misc/section-header";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const {
    search,
    setSearch,
    role,
    setRole,
    plan,
    setPlan,
    status,
    setStatus,
    debouncedSearch,
    filters,
    hasFilters,
    clearFilters,
  } = useUsersFilters();

  const { data, isLoading, error } = useAdminUsers(filters);
  const users = data?.data ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Admin" title="Users" description="All registered accounts." />

      <UsersFilterBar
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        plan={plan}
        onPlanChange={setPlan}
        status={status}
        onStatusChange={setStatus}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      <UsersTable users={users} isLoading={isLoading} error={error} search={debouncedSearch} />
    </div>
  );
}
