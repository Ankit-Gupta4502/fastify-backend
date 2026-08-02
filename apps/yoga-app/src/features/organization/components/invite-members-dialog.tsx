import { useState } from "react";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInviteMembers } from "@/features/organization/hooks/use-organization-members";

interface InviteMembersDialogProps {
  organizationId: string;
}

export function InviteMembersDialog({ organizationId }: InviteMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ invited: string[]; skipped: string[] } | null>(null);
  const invite = useInviteMembers(organizationId);

  function updateEmail(index: number, value: string) {
    setEmails((prev) => prev.map((e, i) => (i === index ? value : e)));
  }

  function addField() {
    setEmails((prev) => [...prev, ""]);
  }

  function removeField(index: number) {
    setEmails((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleSubmit() {
    setError(null);
    setResult(null);
    const cleaned = Array.from(new Set(emails.map((e) => e.trim()).filter(Boolean)));
    if (cleaned.length === 0) {
      setError("Enter at least one email address");
      return;
    }
    invite.mutate(cleaned, {
      onSuccess: (response) => {
        if (response.data) setResult(response.data);
        setEmails([""]);
      },
      onError: (err) => setError(err instanceof Error ? err.message : "Failed to send invites"),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setResult(null);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="size-4" />
          Invite members
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
          <DialogDescription>Each person gets an invite link by email.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Email addresses</Label>
          <div className="space-y-2">
            {emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeField(index)}
                  disabled={emails.length === 1}
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={addField}
          >
            <Plus className="size-3.5" />
            Add more
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="text-xs space-y-1 rounded-xl bg-muted/40 p-3">
            {result.invited.length > 0 && (
              <p className="text-emerald-600">Invited: {result.invited.join(", ")}</p>
            )}
            {result.skipped.length > 0 && (
              <p className="text-muted-foreground">Already invited: {result.skipped.join(", ")}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={invite.isPending} className="w-full">
            {invite.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              "Send invites"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
