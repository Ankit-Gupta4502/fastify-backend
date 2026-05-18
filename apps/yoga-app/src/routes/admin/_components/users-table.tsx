import type { AdminUser } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: Error | null;
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-none",
  instructor: "bg-accent/10 text-accent border-none",
  user: "bg-secondary text-muted-foreground border-none",
};

export function UsersTable({ users, isLoading, error }: UsersTableProps) {
  if (error) {
    return (
      <div className="rounded-2xl bg-destructive/5 border border-destructive/30 text-destructive p-6 text-sm">
        Failed to load users.
      </div>
    );
  }

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
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            : users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_STYLES[u.role] ?? ROLE_STYLES.user}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {u.planName?.replace("_", " ") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      {!isLoading && users.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">No users found.</p>
      )}
    </div>
  );
}
