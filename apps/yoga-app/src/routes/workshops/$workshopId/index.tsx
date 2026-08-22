import { createFileRoute } from "@tanstack/react-router";
import { useWorkshop, workshopQueryOptions } from "@/features/workshops/hooks/use-workshops";
import { NotFound } from "@/shared/components/misc/not-found";
import { WorkshopDetail } from "@/features/workshops/components/workshop-detail";
import { WorkshopDetailSkeleton } from "@/features/workshops/components/workshop-detail-skeleton";
import { getQueryClient } from "@/lib/react-query/query-client";
import { buildWorkshopHead } from "@/shared/lib/seo";

export const Route = createFileRoute("/workshops/$workshopId/")({
  loader: async ({ params }) => {
    const qc = getQueryClient();
    await qc.prefetchQuery(workshopQueryOptions.detail(params.workshopId));
    return qc.getQueryData(workshopQueryOptions.detail(params.workshopId).queryKey) ?? null;
  },
  head: ({ loaderData }) => buildWorkshopHead((loaderData as { data?: Parameters<typeof buildWorkshopHead>[0] } | null)?.data),
  component: WorkshopDetailPage,
});

function WorkshopDetailPage() {
  const { workshopId } = Route.useParams();
  const { data, isLoading, isError } = useWorkshop(workshopId);
  const workshop = data?.data;

  if (isLoading) return <WorkshopDetailSkeleton />;
  if (isError || !workshop) {
    return (
      <NotFound
        title="Workshop not found"
        description="This workshop may have ended or is no longer active."
        backTo="/"
        backLabel="Back to home"
      />
    );
  }

  return <WorkshopDetail workshop={workshop} />;
}
