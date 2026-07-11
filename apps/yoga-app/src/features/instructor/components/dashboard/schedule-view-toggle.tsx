import { CalendarDays, List } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type ScheduleView = "list" | "calendar";

interface ScheduleViewToggleProps {
  view: ScheduleView;
  onChange: (view: ScheduleView) => void;
}

const OPTIONS: { value: ScheduleView; label: string; icon: typeof List }[] = [
  { value: "list", label: "List", icon: List },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
];

export function ScheduleViewToggle({ view, onChange }: ScheduleViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 self-start">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
            view === value
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
