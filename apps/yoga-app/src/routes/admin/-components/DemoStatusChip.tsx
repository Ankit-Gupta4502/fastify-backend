import type { DemoRequestStatus } from "@yoga-app/shared";
import { Chip } from "@/components/shared/Chip";
import type { ChipVariant } from "@/components/shared/Chip";

const STATUS_VARIANT: Record<DemoRequestStatus, ChipVariant> = {
  pending: "warning",
  approved: "info",
  rejected: "muted",
  needs_information: "warning",
  instructor_assigned: "info",
  meeting_scheduled: "success",
  completed: "muted",
};

const STATUS_OVERRIDE_CLASS: Partial<Record<DemoRequestStatus, string>> = {
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export const STATUS_LABELS: Record<DemoRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  needs_information: "Needs Info",
  instructor_assigned: "Assigned",
  meeting_scheduled: "Scheduled",
  completed: "Completed",
};

interface DemoStatusChipProps {
  status: DemoRequestStatus;
}

export function DemoStatusChip({ status }: DemoStatusChipProps) {
  return (
    <Chip
      variant={STATUS_VARIANT[status]}
      className={STATUS_OVERRIDE_CLASS[status]}
    >
      {STATUS_LABELS[status]}
    </Chip>
  );
}
