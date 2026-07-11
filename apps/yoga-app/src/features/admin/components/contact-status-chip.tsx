import type { ContactQueryStatus } from "@yoga-app/shared";
import { Chip } from "@/shared/components/misc/chip";
import type { ChipVariant } from "@/shared/components/misc/chip";

const STATUS_VARIANT: Record<ContactQueryStatus, ChipVariant> = {
  new: "warning",
  resolved: "success",
};

export const CONTACT_STATUS_LABELS: Record<ContactQueryStatus, string> = {
  new: "New",
  resolved: "Resolved",
};

interface ContactStatusChipProps {
  status: ContactQueryStatus;
}

export function ContactStatusChip({ status }: ContactStatusChipProps) {
  return <Chip variant={STATUS_VARIANT[status]}>{CONTACT_STATUS_LABELS[status]}</Chip>;
}
