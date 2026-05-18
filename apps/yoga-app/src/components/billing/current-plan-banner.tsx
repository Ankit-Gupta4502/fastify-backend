import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentPlanBannerProps {
  isLoading: boolean;
  planName?: string;
}

export function CurrentPlanBanner({ isLoading, planName }: CurrentPlanBannerProps) {
  return (
    <Card className="border-none bg-secondary/30 rounded-3xl">
      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Current plan
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-32 mt-1" />
            ) : (
              <p className="text-lg font-bold capitalize">
                {planName?.replace("_", " ") || "None"}
              </p>
            )}
          </div>
        </div>
        {planName && (
          <Badge className="bg-accent/15 text-accent border-none px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
