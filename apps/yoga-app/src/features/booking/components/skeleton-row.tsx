import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-4"><Skeleton className="h-4 w-full rounded-lg" /></td>
      ))}
    </tr>
  );
}
