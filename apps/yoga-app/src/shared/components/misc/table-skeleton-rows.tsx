import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonRowsProps {
  rows?: number;
  cols: number;
}

export function TableSkeletonRows({ rows = 4, cols }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full rounded-md" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
