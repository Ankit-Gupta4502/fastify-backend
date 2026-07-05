import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Chip } from "@/shared/components/misc/chip";
import type { ChipVariant } from "@/shared/components/misc/chip";

const STATUS_VARIANT: Record<string, ChipVariant> = {
  active: "success",
  expired: "muted",
  cancelled: "muted",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  active: CheckCircle2,
  expired: XCircle,
  cancelled: XCircle,
};

interface SubscriptionStatusChipProps {
  status: string;
}

export function SubscriptionStatusChip({ status }: SubscriptionStatusChipProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  return (
    <Chip variant={STATUS_VARIANT[status] ?? "warning"} icon={STATUS_ICON[status] ?? Clock}>
      {label}
    </Chip>
  );
}
