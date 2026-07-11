import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { SlotEntry } from "@/features/booking/hooks/use-book-private-session";

// ─── Duration picker ──────────────────────────────────────────────────────────

export function DurationPicker({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (v: number) => void;
  options: readonly { label: string; value: number }[];
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all",
            value === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary/40 text-foreground bg-background",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Individual slot form card ────────────────────────────────────────────────

function formatSlotLabel(slot: SlotEntry) {
  const start = new Date(`${slot.date}T${slot.startTime}`);
  return {
    dateStr: start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    timeStr: start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function ManualSlotCard({
  slot,
  index,
  total,
  today,
  durationOptions,
  onUpdate,
  onRemove,
}: {
  slot: SlotEntry;
  index: number;
  total: number;
  today: string;
  durationOptions: readonly { label: string; value: number }[];
  onUpdate: (patch: Partial<SlotEntry>) => void;
  onRemove: () => void;
}) {
  const filled = slot.date && slot.startTime;
  const { dateStr, timeStr } = filled ? formatSlotLabel(slot) : { dateStr: "", timeStr: "" };

  return (
    <div className={cn(
      "rounded-2xl border transition-all",
      filled ? "border-primary/30 bg-primary/5" : "border-border/60 bg-secondary/20",
    )}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center justify-center size-5 rounded-full text-[11px] font-bold shrink-0",
            filled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}>
            {index + 1}
          </span>
          <span className="text-xs font-medium text-foreground">
            {filled ? `${dateStr} · ${timeStr} · ${slot.duration} min` : "Pick a date & time"}
          </span>
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-3 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor={`date-${index}`} className="text-xs font-semibold text-muted-foreground">
            Date
          </Label>
          <Input
            id={`date-${index}`}
            type="date"
            min={today}
            value={slot.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="rounded-xl text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`time-${index}`} className="text-xs font-semibold text-muted-foreground">
            Start time
          </Label>
          <Input
            id={`time-${index}`}
            type="time"
            value={slot.startTime}
            onChange={(e) => onUpdate({ startTime: e.target.value })}
            className="rounded-xl text-sm h-9"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Duration</Label>
          <DurationPicker
            value={slot.duration}
            onChange={(v) => onUpdate({ duration: v })}
            options={durationOptions}
          />
        </div>
      </div>
    </div>
  );
}
