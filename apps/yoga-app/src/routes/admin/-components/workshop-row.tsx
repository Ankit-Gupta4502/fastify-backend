import { Pencil, Trash2, ToggleLeft, ToggleRight, Video, CalendarDays, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminWorkshop } from "@yoga-app/shared";
import { formatCompact } from "@/lib/timezone";

export interface RowProps {
  workshop: AdminWorkshop;
  tz: string;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function WorkshopRow({ workshop: w, tz, isToggling, isDeleting, onToggle, onDelete, onEdit }: RowProps) {
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
