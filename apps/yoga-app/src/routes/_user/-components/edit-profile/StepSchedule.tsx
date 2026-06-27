import { cn } from "@/lib/utils";
import type { PreferredTimeOfDay } from "@yoga-app/shared";

export const TIME_SLOTS: { value: PreferredTimeOfDay; label: string; sub: string }[] = [
  { value: "Morning",   label: "Morning",   sub: "6 AM – 12 PM" },
  { value: "Afternoon", label: "Afternoon", sub: "12 PM – 5 PM" },
  { value: "Evening",   label: "Evening",   sub: "5 PM – 10 PM" },
  { value: "Flexible",  label: "Flexible",  sub: "Any time works" },
];

interface Props {
  preferredTimeOfDay: PreferredTimeOfDay | "";
  timezone: string;
  error?: string;
  onSelect: (v: PreferredTimeOfDay) => void;
}

export function StepSchedule({ preferredTimeOfDay, timezone, error, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {TIME_SLOTS.map(({ value, label, sub }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "flex flex-col items-start rounded-2xl border px-4 py-3.5 text-left transition-all",
              preferredTimeOfDay === value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40",
            )}
          >
            <span className={cn(
              "text-sm font-semibold",
              preferredTimeOfDay === value ? "text-primary" : "text-foreground",
            )}>
              {label}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">Your timezone</span>
        <span className="font-semibold text-foreground">{timezone}</span>
      </div>
    </div>
  );
}
