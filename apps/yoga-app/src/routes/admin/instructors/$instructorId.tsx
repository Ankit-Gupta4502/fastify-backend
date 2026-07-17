import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/shared/components/misc/error-card";
import { Chip } from "@/shared/components/misc/chip";
import { SectionCard } from "@/shared/components/misc/section-card";
import { useAdminInstructorDetail } from "@/features/admin/hooks/use-admin";
import { InstructorOverviewSection } from "@/features/admin/components/instructors/instructor-overview-section";
import { InstructorWalletSection } from "@/features/admin/components/instructors/instructor-wallet-section";
import { InstructorSessionsSection } from "@/features/admin/components/instructors/instructor-sessions-section";

export const Route = createFileRoute("/admin/instructors/$instructorId")({
  component: AdminInstructorDetailPage,
});

function AdminInstructorDetailPage() {
  const { instructorId } = Route.useParams();
  const { data, isLoading, error } = useAdminInstructorDetail(instructorId);
  const instructor = data?.data;

  if (error) return <ErrorCard message="Failed to load instructor details." />;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        to="/admin/instructors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        All instructors
      </Link>

      {/* Header */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : instructor ? (
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{instructor.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{instructor.email}</span>
              <Chip variant={instructor.isApproved ? "success" : "warning"}>
                {instructor.isApproved ? "Approved" : "Pending"}
              </Chip>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sections */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : instructor ? (
        <div className="space-y-4">
          <SectionCard title="Overview">
            <InstructorOverviewSection instructor={instructor} />
          </SectionCard>

          <SectionCard title="Earnings">
            <InstructorWalletSection wallet={instructor.wallet} />
          </SectionCard>

          <SectionCard title={`Sessions (${instructor.sessions.length})`}>
            <InstructorSessionsSection instructorId={instructor.id} sessions={instructor.sessions} />
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
