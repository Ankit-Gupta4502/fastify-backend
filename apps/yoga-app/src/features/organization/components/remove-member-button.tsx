import { useState } from "react";
import { Loader2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRemoveMember } from "@/features/organization/hooks/use-organization-members";

interface RemoveMemberButtonProps {
  organizationId: string;
  memberId: string;
  memberEmail: string;
}

export function RemoveMemberButton({ organizationId, memberId, memberEmail }: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remove = useRemoveMember(organizationId);

  function handleConfirm() {
    setError(null);
    remove.mutate(memberId, {
      onSuccess: () => setOpen(false),
      onError: (err) => setError(err instanceof Error ? err.message : "Failed to remove member"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-destructive hover:text-destructive"
          title="Remove from organization"
        >
          <UserMinus className="size-3.5" />
          <span className="sr-only">Remove from organization</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Remove {memberEmail}?</DialogTitle>
          <DialogDescription>
            They'll lose access to the organization immediately, including any sponsored seat — freeing it up for the
            next member waiting on one.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={remove.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleConfirm} disabled={remove.isPending}>
            {remove.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Removing…
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
