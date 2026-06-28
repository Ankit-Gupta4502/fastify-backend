import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/shared/error-card";
import { Chip } from "@/components/shared/chip";
import { useAdminUserDetail } from "@/hooks/use-admin";
import { UserOverviewSection } from "./-components/user-overview-section";
import { UserSubscriptionsSection } from "./-components/user-subscriptions-section";
import { UserRoomsSection } from "./-components/user-rooms-section";
import { UserPrivateRequestsSection } from "./-components/user-private-requests-section";

export const Route = createFileRoute("/admin/users/$userId")({
  component: AdminUserDetailPage,
});

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function AdminUserDetailPage() {
  const { userId } = Route.useParams();
  const { data, isLoading, error } = useAdminUserDetail(userId);
  const user = data?.data;

  if (error) return <ErrorCard message="Failed to load user details." />;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        All users
      </Link>

      {/* Header */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : user ? (
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Chip variant={user.role === "admin" ? "primary" : user.role === "instructor" ? "info" : "muted"}>
                {user.role}
              </Chip>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sections */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : user ? (
        <div className="space-y-4">
          <SectionCard title="Overview">
            <UserOverviewSection user={user} />
          </SectionCard>

          <SectionCard title={`Subscriptions (${user.subscriptions.length})`}>
            <UserSubscriptionsSection subscriptions={user.subscriptions} />
          </SectionCard>

          <SectionCard title={`Sessions (${user.rooms.length})`}>
            <UserRoomsSection rooms={user.rooms} />
          </SectionCard>

          <SectionCard title={`Private Session Requests (${user.privateRequests.length})`}>
            <UserPrivateRequestsSection requests={user.privateRequests} />
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
