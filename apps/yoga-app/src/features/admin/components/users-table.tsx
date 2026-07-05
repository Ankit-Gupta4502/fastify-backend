import { useNavigate } from "@tanstack/react-router";
import type { AdminUser } from "@yoga-app/shared";
import { Chip } from "@/shared/components/misc/chip";
import type { ChipVariant } from "@/shared/components/misc/chip";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn, TablePagination } from "@/shared/components/tables";
import { SubscriptionStatusChip } from "@/features/admin/components/subscription-status-chip";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: Error | null;
  search?: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
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

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "plan", header: "Plan" },
  { key: "source", header: "Source" },
  { key: "joined", header: "Joined" },
];

export function UsersTable({
  users,
  isLoading,
  error,
  search,
  page,
  pageSize,
  total,
  onPageChange,
}: UsersTableProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      columns={COLUMNS}
      data={users}
      isLoading={isLoading}
      loadingRows={6}
      error={error}
      errorMessage="Failed to load users."
      emptyMessage={search ? `No users matching "${search}".` : "No users found."}
      footer={
        !isLoading && users.length > 0 ? (
          <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
        ) : null
      }
      getRowKey={(u) => u.id}
      getRowProps={(u) => ({
        className: "cursor-pointer",
        onClick: () => navigate({ to: "/admin/users/$userId", params: { userId: u.id } }),
      })}
      renderCells={(u) => {
        const isActive = u.subscriptions.find((s) => s.status === "active");
        return (
          <>
            <TableCell className="font-medium">{u.name}</TableCell>
            <TableCell className="text-muted-foreground">{u.email}</TableCell>
            <TableCell>
              <Chip variant={ROLE_CHIP_VARIANT[u.role] ?? "muted"}>{u.role}</Chip>
            </TableCell>
            <TableCell>
              {u.subscriptions.length === 0 ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize text-muted-foreground">
                      {isActive?.planName.replace(/_/g, " ")}
                    </span>
                    <SubscriptionStatusChip status={isActive?.status || ""} />
                  </div>
                </div>
              )}
            </TableCell>
            <TableCell>
              <SourceBadge source={u.acquisition?.utmSource} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(u.createdAt).toLocaleDateString()}
            </TableCell>
          </>
        );
      }}
    />
  );
}
