import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="flex-none w-72 rounded-2xl border border-border overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="px-5 pt-4 pb-2 space-y-2">
        <Skeleton className="h-5 w-32 rounded-lg" />
        <Skeleton className="h-3.5 w-20 rounded-full" />
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-border/60 flex items-center justify-between">
        <Skeleton className="h-3.5 w-16 rounded-full" />
        <Skeleton className="size-3.5 rounded-full" />
      </div>
    </div>
  );
}
