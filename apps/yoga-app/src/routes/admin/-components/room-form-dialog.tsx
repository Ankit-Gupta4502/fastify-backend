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
  const { form, error, startUtc, endUtc, handleSubmit, isEditing, isPending } = useRoomForm(
    open,
    room,
    () => onOpenChange(false),
  );
  const { register, watch, setValue, formState: { errors } } = form;
  const tz = watch("tz");
  const capacity = watch("capacity");

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
          <Field label="Instructor" error={errors.instructorId?.message}>
            <select
              className={cn("input", errors.instructorId && "border-destructive")}
              {...register("instructorId")}
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
          <Field label="Class name (optional)" error={errors.name?.message}>
            <input
              type="text"
              placeholder="e.g. Sunrise Vinyasa Flow"
              maxLength={100}
              className={cn("input", errors.name && "border-destructive")}
              {...register("name")}
            />
          </Field>

          {/* Timezone selector */}
          <Field label="Input timezone (US)">
            <div className="flex flex-wrap gap-2">
              {US_TIMEZONES.map(({ label, tz: zone }) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setValue("tz", zone, { shouldValidate: true })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                    tz === zone
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Start date + time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" error={errors.date?.message}>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                className={cn("input", errors.date && "border-destructive")}
                {...register("date")}
              />
            </Field>
            <Field label="Start time" error={errors.startTime?.message}>
              <input
                type="time"
                className={cn("input", errors.startTime && "border-destructive")}
                {...register("startTime")}
              />
            </Field>
          </div>

          {/* End date + time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="End date" error={errors.endDate?.message}>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                className={cn("input", errors.endDate && "border-destructive")}
                {...register("endDate")}
              />
            </Field>
            <Field label="End time" error={errors.endTime?.message}>
              <input
                type="time"
                className={cn("input", errors.endTime && "border-destructive")}
                {...register("endTime")}
              />
            </Field>
          </div>

          {/* Google Meet link */}
          <Field label="Google Meet link" error={errors.meetLink?.message}>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="url"
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                className={cn("input pl-9", errors.meetLink && "border-destructive")}
                required
                {...register("meetLink")}
              />
            </div>
          </Field>

          {/* Capacity */}
          <Field label={`Capacity: ${capacity} spots`} error={errors.capacity?.message}>
            <input
              type="range"
              min={2}
              max={50}
              className="w-full accent-primary"
              {...register("capacity", { valueAsNumber: true })}
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
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
