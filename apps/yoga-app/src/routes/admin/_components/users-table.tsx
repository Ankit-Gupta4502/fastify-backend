import type { AdminUser } from "@yoga-app/shared";
import { Chip } from "@/components/shared/chip";
import { TableSkeletonRows } from "@/components/shared/table-skeleton-rows";
import { ErrorCard } from "@/components/shared/error-card";
import type { ChipVariant } from "@/components/shared/chip";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: Error | null;
}

const ROLE_CHIP_VARIANT: Record<string, ChipVariant> = {
  admin: "primary",
  instructor: "info",
  user: "muted",
};

export function UsersTable({ users, isLoading, error }: UsersTableProps) {
  if (error) return <ErrorCard message="Failed to load users." />;

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Role</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Plan</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading ? (
            <TableSkeletonRows rows={6} cols={5} />
          ) : (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Chip variant={ROLE_CHIP_VARIANT[u.role] ?? "muted"}>{u.role}</Chip>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">
                  {u.planName?.replace("_", " ") ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {!isLoading && users.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">No users found.</p>
      )}
    </div>
  );
}
