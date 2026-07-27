import { Check, Copy, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClipboard } from "@/shared/hooks";
import { REFERRAL_REWARD_SESSION_COUNT } from "@/features/referrals/constants";

interface ReferralLinkCardProps {
  referralLink?: string;
  isLoading?: boolean;
}

export function ReferralLinkCard({ referralLink, isLoading }: ReferralLinkCardProps) {
  const { copied, copy } = useClipboard();

  return (
    <Card className="rounded-2xl border-primary/15 bg-primary/5">
      <CardContent className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Gift className="size-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-bold text-sm">Share your link, earn free sessions</p>
          <p className="text-xs text-muted-foreground">
            When a friend signs up with your link and makes their first purchase, you get{" "}
            {REFERRAL_REWARD_SESSION_COUNT} free private sessions.
          </p>
        </div>
        <div className="flex items-center gap-2 md:w-80 shrink-0">
          {isLoading || !referralLink ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <>
              <Input readOnly value={referralLink} className="h-9 text-xs" />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={() => copy(referralLink)}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
