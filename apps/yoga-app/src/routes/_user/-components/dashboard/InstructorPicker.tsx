import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Instructor {
  id: string;
  name: string;
  specialty: string[];
}

interface InstructorPickerProps {
  isLoading: boolean;
  instructors: Instructor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function InstructorPicker({
  isLoading,
  instructors,
  selectedId,
  onSelect,
}: InstructorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">Select instructor</Label>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
          <Loader2 className="size-4 animate-spin" />
          Loading instructors…
        </div>
      ) : instructors.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No instructors are available. Please check back later.
        </p>
      ) : (
        <Select value={selectedId ?? ""} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an instructor…" />
          </SelectTrigger>
          <SelectContent>
            {instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id}>
                <span className="font-medium">{instructor.name}</span>
                {instructor.specialty.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {instructor.specialty.slice(0, 2).join(" · ")}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
