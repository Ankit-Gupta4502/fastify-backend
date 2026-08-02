import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { organizationsApi } from "@/api";

interface OrgInviteBannerProps {
  token: string;
}

export function OrgInviteBanner({ token }: OrgInviteBannerProps) {
  const { data } = useQuery({
    queryKey: ["organizations", "invite-preview", token],
    queryFn: () => organizationsApi.getInvitePreview(token),
    staleTime: 60_000,
  });

  const organizationName = data?.data?.organizationName;

  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/6 px-4 py-3 text-sm">
      <Building2 className="size-4 text-primary shrink-0" />
      <span className="text-foreground">
        {organizationName
          ? <>You've been invited to join <strong>{organizationName}</strong></>
          : "You've been invited to join an organization"}
      </span>
    </div>
  );
}
