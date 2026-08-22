import { createFileRoute } from "@tanstack/react-router";
import { Gift, Users } from "lucide-react";
import { useMyReferrals } from "@/features/referrals/hooks/use-referrals";
import { ReferralLinkCard, ReferralStatusChip } from "@/features/referrals/components";
import { SectionHeader } from "@/shared/components/misc/section-header";
import { EmptyState } from "@/shared/components/misc/empty-state";
import { StatCard } from "@/shared/components/misc/stat-card";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";

export const Route = createFileRoute("/_user/referrals/")({
  component: ReferralsPage,
});

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "joined", header: "Joined" },
  { key: "status", header: "Status" },
];

function ReferralsPage() {
  const referrals = useMyReferrals();
  const dashboard = referrals.data?.data;
  const referredUsers = dashboard?.referredUsers ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8">
      <SectionHeader
        eyebrow="Referrals"
        title="Invite friends, earn free sessions"
        description="Share your link — when a friend joins and makes their first purchase, you both win."
      />

      <ReferralLinkCard referralLink={dashboard?.referralLink} isLoading={referrals.isLoading} />

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <StatCard
          label="Friends referred"
          value={String(dashboard?.referredCount ?? 0)}
          icon={Users}
          accent="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-500/10"
          loading={referrals.isLoading}
        />
        <StatCard
          label="Rewards earned"
          value={String(dashboard?.rewardedCount ?? 0)}
          icon={Gift}
          accent="text-primary"
          bg="bg-primary/10"
          loading={referrals.isLoading}
        />
      </div>

      <DataTable
        columns={COLUMNS}
        data={referredUsers}
        isLoading={referrals.isLoading}
        loadingRows={2}
        error={referrals.error}
        errorMessage="Failed to load your referrals. Please refresh."
        emptyMessage={
          <EmptyState
            icon={Users}
            title="No referrals yet"
            description="Copy your link above and share it with friends to get started."
          />
        }
        getRowKey={(u) => u.id}
        renderCells={(u) => (
          <>
            <TableCell className="font-medium">{u.name}</TableCell>
            <TableCell className="text-muted-foreground">{u.email}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(u.joinedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <ReferralStatusChip status={u.status} />
            </TableCell>
          </>
        )}
      />
    </div>
  );
}
