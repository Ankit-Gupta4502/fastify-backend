import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortKey = "time" | "instructor" | "spots";
export type SortDir = "asc" | "desc";

interface SortThProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}

export function SortTh({ label, sortKey, current, dir, onSort }: SortThProps) {
  const active = current === sortKey;
  return (
    <th
      className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={cn("transition-opacity", active ? "opacity-100" : "opacity-0")}>
          {active && dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </span>
      </span>
    </th>
  );
}
