import { Clock3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours % 12 || 12;

  return { value, label: `${displayHours}:${String(minutes).padStart(2, "0")} ${period}` };
});

interface AvailabilityTimePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
}

export function AvailabilityTimePicker({
  value,
  onValueChange,
  ariaLabel,
}: AvailabilityTimePickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-36 rounded-xl" aria-label={ariaLabel}>
        <Clock3 className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72 rounded-xl">
        {TIME_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
