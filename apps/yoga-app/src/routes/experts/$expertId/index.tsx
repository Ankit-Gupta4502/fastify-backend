import { createFileRoute } from "@tanstack/react-router";
import { useExpertProfile } from "@/hooks/use-instructors";
import { NotFound } from "@/components/shared/not-found";
import { InstructorDetail } from "../-components/InstructorDetail";
import { DetailSkeleton } from "../-components/InstructorDetail/Skeleton";

export const Route = createFileRoute("/experts/$expertId/")({
  component: ExpertDetailPage,
});

function ExpertDetailPage() {
  const { expertId } = Route.useParams();
  const { data, isLoading, isError } = useExpertProfile(expertId);
  const instructor = data?.data;

  if (isLoading) return <DetailSkeleton />;
  if (isError || !instructor) return (
    <NotFound
      title="Instructor not found"
      description="This instructor may no longer be active."
      backTo="/experts"
      backLabel="Browse all experts"
    />
  );

  return <InstructorDetail instructor={instructor} />;
}
