import { createFileRoute } from "@tanstack/react-router";
import { useAdminInstructors } from "@/hooks/use-admin";
import { InstructorsTable } from "./_components/instructors-table";

export const Route = createFileRoute("/admin/instructors")({
  component: AdminInstructorsPage,
});

function AdminInstructorsPage() {
  const { data, isLoading, error } = useAdminInstructors();
  const instructors = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
          Admin
        </span>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Instructors</h1>
        <p className="text-muted-foreground text-sm">All registered instructors and their availability.</p>
      </div>
      <InstructorsTable instructors={instructors} isLoading={isLoading} error={error} />
    </div>
  );
}
