import { Loader2, User } from "lucide-react";
import { Label } from "@/components/ui/label";

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
        <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
          {instructors.map((instructor) => (
            <button
              key={instructor.id}
              type="button"
              onClick={() => onSelect(instructor.id)}
              className={[
                "w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
                selectedId === instructor.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
              ].join(" ")}
            >
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{instructor.name}</p>
                {instructor.specialty.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate">
                    {instructor.specialty.slice(0, 2).join(" · ")}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
