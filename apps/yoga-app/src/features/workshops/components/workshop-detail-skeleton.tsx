import { Skeleton } from "@/components/ui/skeleton";

export function WorkshopDetailSkeleton() {
  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto space-y-8">
      <Skeleton className="h-56 sm:h-72 w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-1/2 rounded-lg" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
