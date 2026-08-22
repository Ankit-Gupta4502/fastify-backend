import { CalendarDays, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/shared/components/misc/error-card";
import type { OrganizationClass } from "@/api";
import { ClassAttendeesDialog } from "@/features/organization/components/class-attendees-dialog";

interface ClassesAgendaProps {
  classes: OrganizationClass[];
  isLoading: boolean;
  error: Error | null;
}

function groupByDay(classes: OrganizationClass[]): Map<string, OrganizationClass[]> {
  const groups = new Map<string, OrganizationClass[]>();
  for (const klass of classes) {
    const key = new Date(klass.scheduledStart).toDateString();
    const list = groups.get(key) ?? [];
    list.push(klass);
    groups.set(key, list);
  }
  return groups;
}

export function ClassesAgenda({ classes, isLoading, error }: ClassesAgendaProps) {
  if (error) return <ErrorCard message="Failed to load classes." />;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center">
        <CalendarDays className="mx-auto size-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No upcoming org-restricted classes scheduled.</p>
      </div>
    );
  }

  const groups = groupByDay(classes);

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([day, dayClasses]) => (
        <div key={day}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-2">
            {dayClasses.map((klass) => (
              <Card key={klass.id} className="rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{klass.name ?? "Group class"}</p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {new Date(klass.scheduledStart).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      {" – "}
                      {new Date(klass.scheduledEnd).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="size-3.5" />
                      {klass.instructorName}
                    </span>
                  </div>
                </div>
                <ClassAttendeesDialog klass={klass} />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
