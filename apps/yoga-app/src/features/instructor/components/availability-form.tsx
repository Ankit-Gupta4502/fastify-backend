import type { InstructorProfile } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { relativeFromNow } from "@/shared/lib/timezone";
import { AVAILABILITY_DAYS } from "@/shared/constants";
import { useAvailabilityForm } from "./use-availability-form";

interface AvailabilityFormProps {
  profile: InstructorProfile;
}

export function AvailabilityForm({ profile }: AvailabilityFormProps) {
  const { form, onSubmit, saved, isSaving, saveError } = useAvailabilityForm(profile);
  const { watch, setValue, formState: { errors } } = form;
  const days = watch("days");
  const monday = days[0];
  const canCopyMonday = monday.enabled && days.some((d, i) => i !== 0 && d.enabled);

  function copyMondayToAll() {
    days.forEach((day, i) => {
      if (i === 0 || !day.enabled) return;
      setValue(`days.${i}.start`, monday.start, { shouldValidate: true });
      setValue(`days.${i}.end`, monday.end, { shouldValidate: true });
    });
  }

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
          const dayError = errors.days?.[index]?.end;
          return (
            <div key={dow} className="flex flex-wrap items-center gap-3 px-4 py-3">
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
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  <Input
                    type="time"
                    className="rounded-xl w-32"
                    value={day.start}
                    onChange={(e) => setValue(`days.${index}.start`, e.target.value, { shouldValidate: true })}
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input
                    type="time"
                    className="rounded-xl w-32"
                    value={day.end}
                    onChange={(e) => setValue(`days.${index}.end`, e.target.value, { shouldValidate: true })}
                  />
                  {dayError && <p className="text-xs text-destructive w-full">{dayError.message}</p>}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>

      {canCopyMonday && (
        <button
          type="button"
          onClick={copyMondayToAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          Copy Monday&rsquo;s hours to all enabled days
        </button>
      )}

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
