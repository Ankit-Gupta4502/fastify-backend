import { Skeleton } from "@/components/ui/skeleton";

export function DetailSkeleton() {
  return (
    <div className="py-8 space-y-8">
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-52 rounded-3xl" />
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <div className="space-y-5">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-16 rounded-3xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
