import { Skeleton } from "@/components/ui/skeleton";

export function InstructorSpotlightCardSkeleton() {
  return (
    <div className="flex-none w-64 rounded-3xl border border-border/30 bg-card/50 overflow-hidden">
      <Skeleton className="h-20 w-full rounded-none" />
      <div className="px-5 pt-9 pb-4 space-y-3">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="h-2.5 w-20 rounded-full" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-border/20 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    </div>
  );
}
