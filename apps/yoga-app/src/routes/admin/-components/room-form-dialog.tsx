import { toZonedTime, format as tzFormat } from "date-fns-tz";
import { Video } from "lucide-react";
import type { AdminInstructor, AdminRoom } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { US_TIMEZONES, PREVIEW_ZONES, formatInZone } from "./create-room-dialog-config";
import { useRoomForm } from "./use-room-form";

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructors: AdminInstructor[];
  room: AdminRoom | null;
}

export function RoomFormDialog({ open, onOpenChange, instructors, room }: RoomFormDialogProps) {
  const { form, patch, error, startUtc, endUtc, handleSubmit, isEditing, isPending } = useRoomForm(
    open,
    room,
    () => onOpenChange(false),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit live session" : "Schedule live session"}
          </DialogTitle>
          <DialogDescription>
            Enter times in a US timezone — we'll show you how it converts for users worldwide.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Instructor */}
          <Field label="Instructor">
            <select
              value={form.instructorId}
              onChange={(e) => patch({ instructorId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select instructor…</option>
              {instructors.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name}
                  {ins.status === "available" ? "" : " (unavailable)"}
                </option>
              ))}
            </select>
          </Field>

          {/* Class name */}
          <Field label="Class name (optional)">
            <input
              type="text"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Sunrise Vinyasa Flow"
              maxLength={100}
              className="input"
            />
          </Field>

          {/* Timezone selector */}
          <Field label="Input timezone (US)">
            <div className="flex flex-wrap gap-2">
              {US_TIMEZONES.map(({ label, tz }) => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => patch({ tz })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                    form.tz === tz
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Date + times */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date" className="col-span-3 sm:col-span-1">
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => patch({ date: e.target.value })}
                className="input"
                required
              />
            </Field>
            <Field label="Start time">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => patch({ startTime: e.target.value })}
                className="input"
                required
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => patch({ endTime: e.target.value })}
                className="input"
                required
              />
            </Field>
          </div>

          {/* Google Meet link */}
          <Field label="Google Meet link (optional)">
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="url"
                value={form.meetLink}
                onChange={(e) => patch({ meetLink: e.target.value })}
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                className="input pl-9"
              />
            </div>
          </Field>

          {/* Capacity */}
          <Field label={`Capacity: ${form.capacity} spots`}>
            <input
              type="range"
              min={2}
              max={50}
              value={form.capacity}
              onChange={(e) => patch({ capacity: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>2</span><span>50</span>
            </div>
          </Field>

          {/* Live timezone preview */}
          {startUtc && endUtc && (
            <div className="rounded-2xl bg-secondary/40 border border-border/50 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                How users will see this class
              </p>
              {PREVIEW_ZONES.map(({ label, tz }) => (
                <div key={tz} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground w-28 shrink-0">{label}</span>
                  <span className="font-medium text-right">
                    {formatInZone(startUtc, tz)} → {tzFormat(toZonedTime(endUtc, tz), "h:mm a", { timeZone: tz })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/5 border border-destructive/30 text-destructive text-sm px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isPending}>
              {isPending ? (isEditing ? "Saving…" : "Creating…") : isEditing ? "Save changes" : "Create class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
