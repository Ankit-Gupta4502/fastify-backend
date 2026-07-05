import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  bg: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent, bg, loading }: StatCardProps) {
  return (
    <Card className="border border-border/60 shadow-none bg-card/50 rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("size-4.5", accent)} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-5 w-14 mt-1" />
          ) : (
            <p className="text-lg font-bold capitalize truncate">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
