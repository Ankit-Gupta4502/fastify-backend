import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("size-6", accent)} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-6 w-16 mt-1" />
          ) : (
            <p className="text-xl font-bold capitalize truncate">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
