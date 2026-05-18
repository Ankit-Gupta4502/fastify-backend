import type { AdminInstructor } from "@yoga-app/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstructorsTableProps {
  instructors: AdminInstructor[];
  isLoading: boolean;
  error: Error | null;
}

export function InstructorsTable({ instructors, isLoading, error }: InstructorsTableProps) {
  if (error) {
    return (
      <div className="rounded-2xl bg-destructive/5 border border-destructive/30 text-destructive p-6 text-sm">
        Failed to load instructors.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Specialties</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Max sessions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            : instructors.map((ins) => (
                <tr key={ins.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{ins.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ins.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
                        ins.status === "available" ? "text-emerald-600" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          ins.status === "available" ? "bg-emerald-500" : "bg-muted-foreground/50",
                        )}
                      />
                      {ins.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {ins.specialty.length > 0
                        ? ins.specialty.map((s) => (
                            <Badge key={s} className="bg-secondary text-muted-foreground border-none text-[10px]">
                              {s}
                            </Badge>
                          ))
                        : <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ins.maxConcurrentSessions}</td>
                </tr>
              ))}
        </tbody>
      </table>
      {!isLoading && instructors.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">No instructors found.</p>
      )}
    </div>
  );
}
