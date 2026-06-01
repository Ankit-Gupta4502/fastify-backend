import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="flex-none w-60 rounded-3xl border border-border/30 bg-card/50 overflow-hidden">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}
