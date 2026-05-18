import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Video, CalendarDays, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useAdminWorkshops,
  useCreateWorkshop,
  useUpdateWorkshop,
  useDeleteWorkshop,
} from "@/hooks/use-workshops";
import type { AdminWorkshop, CreateWorkshopBody } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/lib/timezone";

export const Route = createFileRoute("/admin/workshops")({
  component: AdminWorkshopsPage,
});

function AdminWorkshopsPage() {
  const { data, isLoading, error } = useAdminWorkshops();
  const workshops = data?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminWorkshop | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Workshops</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage live workshops shown on the home page.
          </p>
        </div>
        <Button
          className="rounded-2xl gap-2 shadow-sm"
          onClick={() => { setEditing(null); setDialogOpen(true); }}
        >
          <Plus className="size-4" />
          New workshop
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          Failed to load workshops.
        </div>
      )}

      <WorkshopsTable
        workshops={workshops}
        isLoading={isLoading}
        onEdit={(w) => { setEditing(w); setDialogOpen(true); }}
      />

      {dialogOpen && (
        <WorkshopDialog
          initial={editing}
          onClose={() => { setDialogOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────── */

interface TableProps {
  workshops: AdminWorkshop[];
  isLoading: boolean;
  onEdit: (w: AdminWorkshop) => void;
}

function WorkshopsTable({ workshops, isLoading, onEdit }: TableProps) {
  const tz = userTimezone();
  const update = useUpdateWorkshop();
  const del = useDeleteWorkshop();

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/20">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Scheduled</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Attendees</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Meet link</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <Skeleton className="h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))
            : workshops.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No workshops yet. Create one to show it on the home page.
                  </td>
                </tr>
              )
              : workshops.map((w) => {
                  const toggling = update.isPending && update.variables?.id === w.id;
                  const deleting = del.isPending && del.variables === w.id;
                  return (
                    <tr key={w.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors group">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold">{w.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{w.description}</p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                        {w.scheduledAt ? (
                          <span className="flex items-center gap-1.5 text-xs">
                            <CalendarDays className="size-3.5 text-primary" />
                            {formatCompact(w.scheduledAt, tz)}
                          </span>
                        ) : "—"}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="size-3.5" />
                          <span className="text-foreground font-medium">{w.attendeeCount}</span>
                          <span>/ {w.maxAttendees}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {w.meetLink ? (
                          <a
                            href={w.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <Video className="size-3.5" />
                            Open link
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
                          disabled={toggling}
                          onClick={() => update.mutate({ id: w.id, body: { isActive: !w.isActive } })}
                        >
                          {toggling ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          ) : w.isActive ? (
                            <ToggleRight className="size-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="size-5 text-muted-foreground" />
                          )}
                          <span className={cn(w.isActive ? "text-emerald-600" : "text-muted-foreground")}>
                            {w.isActive ? "Live" : "Hidden"}
                          </span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg size-7"
                            onClick={() => onEdit(w)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg size-7 text-destructive hover:bg-destructive/10"
                            disabled={deleting}
                            onClick={() => del.mutate(w.id)}
                          >
                            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
        </tbody>
      </table>

      {!isLoading && workshops.length > 0 && (
        <div className="border-t border-border/40 px-4 py-2 text-xs text-muted-foreground bg-secondary/10">
          {workshops.length} workshop{workshops.length !== 1 ? "s" : ""} ·{" "}
          {workshops.filter((w) => w.isActive).length} live
        </div>
      )}
    </div>
  );
}

/* ─── Create / Edit Dialog ───────────────────────────── */

interface DialogProps {
  initial: AdminWorkshop | null;
  onClose: () => void;
}

function WorkshopDialog({ initial, onClose }: DialogProps) {
  const create = useCreateWorkshop();
  const update = useUpdateWorkshop();

  const [form, setForm] = useState<CreateWorkshopBody>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? null,
    meetLink: initial?.meetLink ?? "",
    scheduledAt: initial?.scheduledAt
      ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
      : "",
    maxAttendees: initial?.maxAttendees ?? 50,
    isActive: initial?.isActive ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  const isPending = create.isPending || update.isPending;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.description.trim()) return;
    setError(null);

    const body: CreateWorkshopBody = {
      ...form,
      meetLink: form.meetLink?.trim() || null,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt as string).toISOString() : null,
    };

    const onSuccess = () => onClose();
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : "Something went wrong");

    if (initial) {
      update.mutate({ id: initial.id, body }, { onSuccess, onError });
    } else {
      create.mutate(body, { onSuccess, onError });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div>
          <h2 className="text-xl font-bold">{initial ? "Edit Workshop" : "New Workshop"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {initial ? "Update the workshop details." : "Fill in the details. Toggle live to show it on the home page."}
          </p>
        </div>

        <div className="space-y-3">
          <Field label="Name *">
            <Input
              placeholder="e.g. Morning Breathwork Masterclass"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl"
            />
          </Field>

          <Field label="Description *">
            <textarea
              placeholder="What will participants learn?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Scheduled at">
              <Input
                type="datetime-local"
                value={form.scheduledAt as string}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                className="rounded-xl"
              />
            </Field>
            <Field label="Max attendees">
              <Input
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={(e) => setForm((f) => ({ ...f, maxAttendees: Number(e.target.value) }))}
                className="rounded-xl"
              />
            </Field>
          </div>

          <Field label="Google Meet link">
            <Input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={form.meetLink ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, meetLink: e.target.value }))}
              className="rounded-xl"
            />
          </Field>

          <Field label="Price (in paise, 0 = free)">
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={form.price ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value === "" ? null : Number(e.target.value) }))
              }
              className="rounded-xl"
            />
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="relative"
            >
              {form.isActive ? (
                <ToggleRight className="size-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="size-8 text-muted-foreground" />
              )}
            </button>
            <div>
              <p className="text-sm font-medium">{form.isActive ? "Live on home page" : "Hidden"}</p>
              <p className="text-xs text-muted-foreground">Toggle to show or hide on the home page</p>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 rounded-xl" disabled={isPending} onClick={handleSubmit}>
            {isPending ? <><Loader2 className="size-4 animate-spin mr-2" /> Saving…</> : initial ? "Save changes" : "Create workshop"}
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
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
