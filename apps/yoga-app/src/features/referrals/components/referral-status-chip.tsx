import { CheckCircle2, Clock, UserPlus } from "lucide-react";
import { Chip } from "@/shared/components/misc/chip";
import type { ChipVariant } from "@/shared/components/misc/chip";
import type { ReferredUserStatus } from "@/api";

const STATUS_VARIANT: Record<ReferredUserStatus, ChipVariant> = {
  signed_up: "muted",
  pending: "warning",
  rewarded: "success",
};

const STATUS_ICON: Record<ReferredUserStatus, typeof CheckCircle2> = {
  signed_up: UserPlus,
  pending: Clock,
  rewarded: CheckCircle2,
};

const STATUS_LABEL: Record<ReferredUserStatus, string> = {
  signed_up: "Signed up",
  pending: "Awaiting purchase",
  rewarded: "Reward earned",
};

interface ReferralStatusChipProps {
  status: ReferredUserStatus;
}

export function ReferralStatusChip({ status }: ReferralStatusChipProps) {
  return (
    <Chip variant={STATUS_VARIANT[status]} icon={STATUS_ICON[status]}>
      {STATUS_LABEL[status]}
    </Chip>
  );
}
