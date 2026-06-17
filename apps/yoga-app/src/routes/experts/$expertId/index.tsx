import { createFileRoute } from "@tanstack/react-router";
import { useExpertProfile, instructorQueryOptions } from "@/hooks/use-instructors";
import { NotFound } from "@/components/shared/not-found";
import { InstructorDetail } from "../-components/InstructorDetail";
import { DetailSkeleton } from "../-components/InstructorDetail/Skeleton";
import { getQueryClient } from "@/lib/react-query/query-client";
import { buildExpertHead } from "@/lib/seo";

export const Route = createFileRoute("/experts/$expertId/")({
  loader: async ({ params }) => {
    const qc = getQueryClient();
    await qc.prefetchQuery(instructorQueryOptions.expertProfile(params.expertId));
    return qc.getQueryData(instructorQueryOptions.expertProfile(params.expertId).queryKey) ?? null;
  },
  head: ({ loaderData }) => buildExpertHead((loaderData as { data?: Parameters<typeof buildExpertHead>[0] } | null)?.data),
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
