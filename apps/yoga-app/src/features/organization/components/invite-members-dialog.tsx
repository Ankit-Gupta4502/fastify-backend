import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

function parseEmails(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

export function InviteMembersDialog({ organizationId }: InviteMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ invited: string[]; skipped: string[] } | null>(null);
  const invite = useInviteMembers(organizationId);

  function handleSubmit() {
    setError(null);
    setResult(null);
    const emails = parseEmails(raw);
    if (emails.length === 0) {
      setError("Enter at least one email address");
      return;
    }
    invite.mutate(emails, {
      onSuccess: (response) => {
        if (response.data) setResult(response.data);
        setRaw("");
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
          <DialogDescription>
            One email per line, or separate with commas. Each person gets an invite link by email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="invite-emails" className="text-xs font-medium">Email addresses</Label>
          <Textarea
            id="invite-emails"
            rows={5}
            placeholder={"jane@company.com\njohn@company.com"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
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
