import { Pencil, Trash2, ToggleLeft, ToggleRight, Video, CalendarDays, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUpdateWorkshop, useDeleteWorkshop } from "@/hooks/use-workshops";
import type { AdminWorkshop } from "@yoga-app/shared";
import { formatCompact, userTimezone } from "@/lib/timezone";

interface Props {
  workshops: AdminWorkshop[];
  isLoading: boolean;
  onEdit: (w: AdminWorkshop) => void;
}

export function WorkshopsTable({ workshops, isLoading, onEdit }: Props) {
  const tz = userTimezone();
  const update = useUpdateWorkshop();
  const del = useDeleteWorkshop();

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/20">
              {["Name", "Scheduled", "Attendees", "Meet link", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <Skeleton className="h-4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : workshops.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-muted-foreground text-sm">
                  No workshops yet.{" "}
                  <span className="text-foreground font-medium">Create one</span> to show it on the home page.
                </td>
              </tr>
            ) : (
              workshops.map((w) => (
                <WorkshopRow
                  key={w.id}
                  workshop={w}
                  tz={tz}
                  isToggling={update.isPending && update.variables?.id === w.id}
                  isDeleting={del.isPending && del.variables === w.id}
                  onToggle={() =>
                    update.mutate({ id: w.id, body: { isActive: !w.isActive } })
                  }
                  onDelete={() => del.mutate(w.id)}
                  onEdit={() => onEdit(w)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && workshops.length > 0 && (
        <div className="border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/10 flex items-center gap-3">
          <span>{workshops.length} workshop{workshops.length !== 1 ? "s" : ""}</span>
          <span className="h-3 w-px bg-border" />
          <span className="text-emerald-600 font-medium">
            {workshops.filter((w) => w.isActive).length} live
          </span>
          <span className="h-3 w-px bg-border" />
          <span>{workshops.filter((w) => !w.isActive).length} hidden</span>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  workshop: AdminWorkshop;
  tz: string;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function WorkshopRow({ workshop: w, tz, isToggling, isDeleting, onToggle, onDelete, onEdit }: RowProps) {
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors group">
      {/* Name + description */}
      <td className="px-4 py-3.5 max-w-xs">
        <p className="font-semibold leading-tight">{w.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{w.description}</p>
      </td>

      {/* Scheduled */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {w.scheduledAt ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary shrink-0" />
            {formatCompact(w.scheduledAt, tz)}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      {/* Attendees */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="flex items-center gap-1.5 text-xs">
          <Users className="size-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium">{w.attendeeCount}</span>
          <span className="text-muted-foreground">/ {w.maxAttendees}</span>
        </span>
      </td>

      {/* Meet link */}
      <td className="px-4 py-3.5">
        {w.meetLink ? (
          <a
            href={w.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Video className="size-3.5 shrink-0" />
            Open link
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      {/* Active toggle */}
      <td className="px-4 py-3.5">
        <button
          className="flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer"
          disabled={isToggling}
          onClick={onToggle}
        >
          {isToggling ? (
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

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-lg size-7"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-lg size-7 text-destructive hover:bg-destructive/10"
            disabled={isDeleting}
            onClick={onDelete}
            title="Delete"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
