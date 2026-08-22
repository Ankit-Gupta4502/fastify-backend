import { Loader2, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromoteMember } from "@/features/organization/hooks/use-organization-members";

interface PromoteMemberButtonProps {
  organizationId: string;
  memberId: string;
}

export function PromoteMemberButton({ organizationId, memberId }: PromoteMemberButtonProps) {
  const promote = usePromoteMember(organizationId);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="rounded-lg"
      title="Promote to admin"
      disabled={promote.isPending}
      onClick={() => promote.mutate(memberId)}
    >
      {promote.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldPlus className="size-3.5" />}
      <span className="sr-only">Promote to admin</span>
    </Button>
  );
}
