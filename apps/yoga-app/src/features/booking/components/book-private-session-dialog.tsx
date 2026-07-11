import {
  CheckCircle2,
  CalendarDays,
  Loader2,
  Plus,
  RefreshCw,
  PenLine,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { DAYS_OF_WEEK } from "@/features/booking/constants/book-private-session-config";
import { useBookPrivateSession } from "@/features/booking/hooks/use-book-private-session";
import { ManualSlotCard, DurationPicker } from "./slot-card";
import type { SlotEntry, TabMode } from "@/features/booking/hooks/use-book-private-session";

interface BookPrivateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatSlotLabel(slot: SlotEntry) {
  const start = new Date(`${slot.date}T${slot.startTime}`);
  return {
    dateStr: start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    timeStr: start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Manual tab ───────────────────────────────────────────────────────────────

function ManualTab({
  slots,
  today,
  maxSlots,
  durationOptions,
  addSlot,
  removeSlot,
  updateSlot,
}: {
  slots: SlotEntry[];
  today: string;
  maxSlots: number;
  durationOptions: readonly { label: string; value: number }[];
  addSlot: () => void;
  removeSlot: (i: number) => void;
  updateSlot: (i: number, patch: Partial<SlotEntry>) => void;
}) {
  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <ManualSlotCard
          key={i}
          slot={slot}
          index={i}
          total={slots.length}
          today={today}
          durationOptions={durationOptions}
          onUpdate={(p) => updateSlot(i, p)}
          onRemove={() => removeSlot(i)}
        />
      ))}

      {slots.length < maxSlots && (
        <button
          type="button"
          onClick={addSlot}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-border/60 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Plus className="size-4" />
          Add another session
          <span className="text-xs opacity-50">({slots.length}/{maxSlots})</span>
        </button>
      )}
    </div>
  );
}

// ─── Recurring tab ────────────────────────────────────────────────────────────

function RecurringTab({
  config,
  generatedSlots,
  recurringLimit,
  sessionsLeft,
  today,
  durationOptions,
  onConfigChange,
  onRemoveSlot,
}: {
  config: ReturnType<typeof useBookPrivateSession>["recurringConfig"];
  generatedSlots: SlotEntry[];
  recurringLimit: number;
  sessionsLeft: number;
  today: string;
  durationOptions: readonly { label: string; value: number }[];
  onConfigChange: (patch: Partial<typeof config>) => void;
  onRemoveSlot: (i: number) => void;
}) {
  const allFilled = config.days.length > 0 && config.startTime && config.fromDate && config.toDate;

  function toggleDay(day: number) {
    const next = config.days.includes(day)
      ? config.days.filter((d) => d !== day)
      : [...config.days, day];
    onConfigChange({ days: next });
  }

  return (
    <div className="space-y-4">
      {/* Session limit badge */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Capped at your plan's remaining sessions</span>
        <span className={cn(
          "font-semibold px-2 py-0.5 rounded-full",
          sessionsLeft <= 3
            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
            : "bg-primary/10 text-primary",
        )}>
          {sessionsLeft} {sessionsLeft === 1 ? "session" : "sessions"} left
        </span>
      </div>

      {/* Days picker */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">Days of week</Label>
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const selected = config.days.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                title={day.full}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  selected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rec-time" className="text-xs font-semibold text-muted-foreground">Start time</Label>
          <Input
            id="rec-time"
            type="time"
            value={config.startTime}
            onChange={(e) => onConfigChange({ startTime: e.target.value })}
            className="rounded-xl text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Duration</Label>
          <DurationPicker
            value={config.duration}
            onChange={(v) => onConfigChange({ duration: v })}
            options={durationOptions}
          />
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rec-from" className="text-xs font-semibold text-muted-foreground">From</Label>
          <Input
            id="rec-from"
            type="date"
            min={today}
            value={config.fromDate}
            onChange={(e) => onConfigChange({ fromDate: e.target.value })}
            className="rounded-xl text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rec-to" className="text-xs font-semibold text-muted-foreground">To</Label>
          <Input
            id="rec-to"
            type="date"
            min={config.fromDate || today}
            value={config.toDate}
            onChange={(e) => onConfigChange({ toDate: e.target.value })}
            className="rounded-xl text-sm h-9"
          />
        </div>
      </div>

      {/* Generated preview */}
      {allFilled ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              generatedSlots.length === 0
                ? "bg-muted text-muted-foreground"
                : generatedSlots.length >= recurringLimit
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
            )}>
              {generatedSlots.length === 0
                ? "No sessions in range"
                : `${generatedSlots.length} session${generatedSlots.length !== 1 ? "s" : ""} generated`}
              {generatedSlots.length >= recurringLimit && " (plan limit)"}
            </span>
          </div>

          {generatedSlots.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-secondary/10 divide-y divide-border/40 max-h-52 overflow-y-auto">
              {generatedSlots.map((slot, i) => {
                const { dateStr, timeStr } = formatSlotLabel(slot);
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 group">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{dateStr}</p>
                        <p className="text-xs text-muted-foreground">{timeStr} · {slot.duration} min</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(i)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Fill in days, time, and date range to see your schedule
        </p>
      )}
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

const TABS: { value: TabMode; label: string; icon: React.ElementType }[] = [
  { value: "manual",    label: "Manual",    icon: PenLine },
  { value: "recurring", label: "Recurring", icon: RefreshCw },
];

export function BookPrivateSessionDialog({ open, onOpenChange }: BookPrivateSessionDialogProps) {
  const {
    requestPrivate,
    activeTab, setActiveTab,
    manualSlots, addManualSlot, removeManualSlot, updateManualSlot, maxManualSlots,
    recurringConfig, updateRecurring, recurringSlots, removeRecurringSlot, recurringLimit, sessionsLeft,
    error, submittedRequestId, isFormValid,
    handleOpenChange, handleSubmit,
    durationOptions,
  } = useBookPrivateSession(onOpenChange);

  const today = new Date().toISOString().split("T")[0];
  const activeCount = activeTab === "manual"
    ? manualSlots.filter((s) => s.date && s.startTime).length
    : recurringSlots.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {submittedRequestId ? (
          <div className="py-8 text-center space-y-4">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Schedule submitted!</DialogTitle>
              <DialogDescription className="text-center">
                We&apos;ve received your preferred class times. Our team will match you with a
                dedicated instructor who fits your whole schedule.
              </DialogDescription>
            </DialogHeader>
            <Button className="w-full rounded-xl" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                Set your class schedule
              </DialogTitle>
              <DialogDescription>
                Add all your preferred times — we&apos;ll assign a dedicated instructor to your schedule.
              </DialogDescription>
            </DialogHeader>

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
              {TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="py-1">
              {activeTab === "manual" ? (
                <ManualTab
                  slots={manualSlots}
                  today={today}
                  maxSlots={maxManualSlots}
                  durationOptions={durationOptions}
                  addSlot={addManualSlot}
                  removeSlot={removeManualSlot}
                  updateSlot={updateManualSlot}
                />
              ) : (
                <RecurringTab
                  config={recurringConfig}
                  generatedSlots={recurringSlots}
                  recurringLimit={recurringLimit}
                  sessionsLeft={sessionsLeft}
                  today={today}
                  durationOptions={durationOptions}
                  onConfigChange={updateRecurring}
                  onRemoveSlot={removeRecurringSlot}
                />
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <DialogFooter showCloseButton>
              <Button
                className="rounded-xl font-bold px-6"
                disabled={!isFormValid || requestPrivate.isPending}
                onClick={handleSubmit}
              >
                {requestPrivate.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : activeCount > 0 ? (
                  `Submit ${activeCount} session${activeCount !== 1 ? "s" : ""}`
                ) : (
                  "Submit schedule"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
