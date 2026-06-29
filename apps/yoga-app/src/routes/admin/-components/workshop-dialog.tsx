import { Loader2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminWorkshop } from "@yoga-app/shared";
import { useWorkshopDialogForm } from "./use-workshop-dialog-form";
import { WorkshopImageField } from "./WorkshopImageField";

interface Props {
  initial: AdminWorkshop | null;
  onClose: () => void;
}

export function WorkshopDialog({ initial, onClose }: Props) {
  const { form, error, isPending, upload, fileRef, set, handleImageSelect, handleSubmit } =
    useWorkshopDialogForm(initial, onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold">{initial ? "Edit Workshop" : "New Workshop"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {initial ? "Update workshop details." : "Fill in the details and toggle live to publish."}
            </p>
          </div>
          <Button size="icon-sm" variant="ghost" className="rounded-xl" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Name *">
            <Input
              placeholder="e.g. Morning Breathwork Masterclass"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="rounded-xl"
            />
          </Field>

          <Field label="Description *">
            <textarea
              placeholder="What will participants learn or experience?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </Field>

          <Field label="Cover image">
            <WorkshopImageField
              image={form.image}
              isUploading={upload.isPending}
              fileRef={fileRef}
              onClear={() => set("image", null)}
              onFileChange={handleImageSelect}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Scheduled at">
              <Input
                type="datetime-local"
                value={(form.scheduledAt as string) ?? ""}
                onChange={(e) => set("scheduledAt", e.target.value)}
                className="rounded-xl"
              />
            </Field>
            <Field label="Max attendees">
              <Input
                type="number"
                min={1}
                value={form.maxAttendees ?? 50}
                onChange={(e) => set("maxAttendees", Number(e.target.value))}
                className="rounded-xl"
              />
            </Field>
          </div>

          <Field label="Google Meet link">
            <Input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={(form.meetLink as string) ?? ""}
              onChange={(e) => set("meetLink", e.target.value)}
              className="rounded-xl"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price INR (paise — 0 = free)">
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.priceInr ?? ""}
                onChange={(e) =>
                  set("priceInr", e.target.value === "" ? null : Number(e.target.value))
                }
                className="rounded-xl"
              />
            </Field>
            <Field label="Price USD (cents — 0 = free)">
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.priceUsd ?? ""}
                onChange={(e) =>
                  set("priceUsd", e.target.value === "" ? null : Number(e.target.value))
                }
                className="rounded-xl"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              UTM / Social media price
            </p>
            <p className="text-xs text-muted-foreground -mt-1">
              Applied when a user arrives via a UTM source (e.g. Instagram, Facebook).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="UTM Price INR (paise)">
                <Input
                  type="number"
                  min={0}
                  value={form.utmPriceInr ?? 9900}
                  onChange={(e) => set("utmPriceInr", Number(e.target.value))}
                  className="rounded-xl"
                />
              </Field>
              <Field label="UTM Price USD (cents)">
                <Input
                  type="number"
                  min={0}
                  value={form.utmPriceUsd ?? 100}
                  onChange={(e) => set("utmPriceUsd", Number(e.target.value))}
                  className="rounded-xl"
                />
              </Field>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className="shrink-0"
            >
              {form.isActive ? (
                <ToggleRight className="size-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="size-8 text-muted-foreground" />
              )}
            </button>
            <div>
              <p className="text-sm font-medium leading-tight">
                {form.isActive ? "Live on home page" : "Hidden from home page"}
              </p>
              <p className="text-xs text-muted-foreground">Toggle to publish or unpublish</p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-7 py-5 border-t border-border/40">
          <Button
            className="flex-1 rounded-xl gap-2"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Saving…" : initial ? "Save changes" : "Create workshop"}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
