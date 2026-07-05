import { useNavigate } from "@tanstack/react-router";
import type { AdminUser } from "@yoga-app/shared";
import { Chip } from "@/shared/components/misc/chip";
import { TableSkeletonRows } from "@/shared/components/misc/table-skeleton-rows";
import { ErrorCard } from "@/shared/components/misc/error-card";
import type { ChipVariant } from "@/shared/components/misc/chip";
import { SubscriptionStatusChip } from "@/features/admin/components/subscription-status-chip";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: Error | null;
  search?: string;
}

const ROLE_CHIP_VARIANT: Record<string, ChipVariant> = {
  admin: "primary",
  instructor: "info",
  user: "muted",
};

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  instagram: { label: "Instagram",  cls: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400" },
  facebook:  { label: "Facebook",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  google:    { label: "Google",     cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  youtube:   { label: "YouTube",    cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  tiktok:    { label: "TikTok",     cls: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300" },
  linkedin:  { label: "LinkedIn",   cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400" },
  organic:   { label: "Organic",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
  direct:    { label: "Direct",     cls: "bg-muted text-muted-foreground" },
  referral:  { label: "Referral",   cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400" },
  email:     { label: "Email",      cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
};

function SourceBadge({ source }: { source: string | null | undefined }) {
  if (!source) return <span className="text-muted-foreground text-xs">—</span>;
  const cfg = SOURCE_BADGE[source.toLowerCase()];
  if (!cfg) return <span className="text-xs font-medium capitalize">{source}</span>;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
  );
}

export function UsersTable({ users, isLoading, error, search }: UsersTableProps) {
  const navigate = useNavigate();

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
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Source</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading ? (
            <TableSkeletonRows rows={6} cols={6} />
          ) : (
            users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-secondary/20 transition-colors cursor-pointer"
                onClick={() => navigate({ to: "/admin/users/$userId", params: { userId: u.id } })}
              >
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Chip variant={ROLE_CHIP_VARIANT[u.role] ?? "muted"}>{u.role}</Chip>
                </td>
                <td className="px-4 py-3">
                  {u.subscriptions.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {u.subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-1.5">
                          <span className="capitalize text-muted-foreground">
                            {sub.planName.replace(/_/g, " ")}
                          </span>
                          <SubscriptionStatusChip status={sub.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SourceBadge source={u.acquisition?.utmSource} />
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
        <p className="text-center text-muted-foreground text-sm py-10">
          {search ? `No users matching "${search}".` : "No users found."}
        </p>
      )}
    </div>
  );
}
