import { createFileRoute } from "@tanstack/react-router";
import { ClassesAgenda } from "@/features/organization/components/classes-agenda";
import { useOrganizationClasses } from "@/features/organization/hooks/use-organization-classes";

export const Route = createFileRoute("/org/classes/")({
  component: ClassesPage,
});

function ClassesPage() {
  const { organizationId } = Route.useRouteContext();
  const { data, isLoading, error } = useOrganizationClasses(organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Upcoming classes</h1>
        <p className="text-sm text-muted-foreground">
          Classes scheduled exclusively for your organization, and who's attending each one.
        </p>
      </div>

      <ClassesAgenda classes={data?.data ?? []} isLoading={isLoading} error={error} />
    </div>
  );
}
