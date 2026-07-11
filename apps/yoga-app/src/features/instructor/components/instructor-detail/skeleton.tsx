import { Skeleton } from "@/components/ui/skeleton";

export function DetailSkeleton() {
  return (
    <div className="py-8 sm:py-12 space-y-14 sm:space-y-20">
      <Skeleton className="h-6 w-40 rounded-full" />

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-8 lg:gap-14">
        <Skeleton className="w-full aspect-4/5 md:aspect-auto md:h-full rounded-2xl" />
        <div className="space-y-5">
          <Skeleton className="h-14 w-3/4 rounded-xl" />
          <Skeleton className="h-5 w-1/2 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3 rounded-full" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}
