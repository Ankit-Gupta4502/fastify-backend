import type { InstructorProfile } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { relativeFromNow } from "@/shared/lib/timezone";
import { AVAILABILITY_DAYS } from "@/shared/constants";
import { AvailabilityTimePicker } from "./availability-time-picker";
import { useAvailabilityForm } from "./use-availability-form";

interface AvailabilityFormProps {
  profile: InstructorProfile;
}

export function AvailabilityForm({ profile }: AvailabilityFormProps) {
  const { form, onSubmit, saved, isSaving, saveError } = useAvailabilityForm(profile);
  const { watch, setValue, formState: { errors } } = form;
  const days = watch("days");

  const addSlot = (dayIndex: number) => {
    const slots = days[dayIndex].slots;
    setValue(`days.${dayIndex}.slots`, [...slots, { start: "09:00", end: "18:00" }], { shouldValidate: true });
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const slots = days[dayIndex].slots;
    setValue(`days.${dayIndex}.slots`, slots.filter((_, index) => index !== slotIndex), { shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <Label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Weekly availability
        </Label>
        {profile.availabilityUpdatedAt && (
          <span className="text-xs text-muted-foreground shrink-0">
            Updated {relativeFromNow(profile.availabilityUpdatedAt)}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 divide-y divide-border/40 overflow-hidden">
        {AVAILABILITY_DAYS.map(({ dow, label, short }, index) => {
          const day = days[index];
          return (
            <div key={dow} className="flex flex-wrap items-start gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setValue(`days.${index}.enabled`, !day.enabled, { shouldValidate: true })}
                className={cn(
                  "w-16 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  day.enabled
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
                )}
                title={label}
              >
                {short}
              </button>

              {day.enabled ? (
                <div className="space-y-2 flex-1 min-w-0">
                  {day.slots.map((slot, slotIndex) => {
                    const slotError = errors.days?.[index]?.slots?.[slotIndex]?.end;
                    return (
                      <div key={slotIndex} className="flex flex-wrap items-center gap-2">
                        <AvailabilityTimePicker
                          value={slot.start}
                          onValueChange={(value) => setValue(`days.${index}.slots.${slotIndex}.start`, value, { shouldValidate: true })}
                          ariaLabel={`${label} time slot ${slotIndex + 1} start time`}
                        />
                        <span className="text-muted-foreground text-xs">to</span>
                        <AvailabilityTimePicker
                          value={slot.end}
                          onValueChange={(value) => setValue(`days.${index}.slots.${slotIndex}.end`, value, { shouldValidate: true })}
                          ariaLabel={`${label} time slot ${slotIndex + 1} end time`}
                        />
                        {day.slots.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive" onClick={() => removeSlot(index, slotIndex)} aria-label={`Remove ${label} time slot ${slotIndex + 1}`}>
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                        {slotError && <p className="text-xs text-destructive w-full">{slotError.message}</p>}
                      </div>
                    );
                  })}
                  <Button type="button" variant="ghost" size="sm" className="rounded-xl text-primary" onClick={() => addSlot(index)}>
                    <Plus className="size-4" /> Add time slot
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" className="rounded-xl px-8" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save availability"}
        </Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
        {saveError && <span className="text-sm text-destructive">{saveError}</span>}
      </div>
    </form>
  );
}
