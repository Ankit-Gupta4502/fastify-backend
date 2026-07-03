import { Video } from "lucide-react";
import type { InstructorDemoSession } from "@yoga-app/shared";
import { Badge } from "@/components/ui/badge";
import { DemoSessionCard } from "./DemoSessionCard";

interface DemoSessionsSectionProps {
  demos: InstructorDemoSession[];
  isLoading: boolean;
}

export function DemoSessionsSection({ demos, isLoading }: DemoSessionsSectionProps) {
  if (!isLoading && demos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="size-4 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">Assigned Demo Sessions</h2>
        {demos.length > 0 && (
          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
            {demos.length}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border/60 p-6 text-center text-sm text-muted-foreground animate-pulse">
          Loading demo sessions…
        </div>
      ) : (
        <div className="space-y-3">
          {demos.map((demo) => (
            <DemoSessionCard key={demo.id} demo={demo} />
          ))}
        </div>
      )}
    </section>
  );
}
