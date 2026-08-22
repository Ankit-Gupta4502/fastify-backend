import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { OrganizationClass } from "@/api";

interface ClassAttendeesDialogProps {
  klass: OrganizationClass;
}

export function ClassAttendeesDialog({ klass }: ClassAttendeesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Users className="size-3.5" />
          {klass.currentOccupancy} attending
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{klass.name ?? "Class"} — attendees</DialogTitle>
          <DialogDescription>
            {klass.currentOccupancy} of {klass.capacity} spots filled
          </DialogDescription>
        </DialogHeader>

        {klass.attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No one has enrolled yet.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {klass.attendees.map((attendee) => (
              <li key={attendee.userId} className="py-2.5 flex flex-col">
                <span className="text-sm font-medium">{attendee.name}</span>
                <span className="text-xs text-muted-foreground">{attendee.email}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
