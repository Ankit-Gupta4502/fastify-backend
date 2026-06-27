import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { OnboardingPurpose } from "@yoga-app/shared";

export const PURPOSES: OnboardingPurpose[] = [
  "Pregnancy",
  "Stress Relief",
  "Anxiety Management",
  "Flexibility Improvement",
  "Weight Loss",
  "Back Pain Relief",
  "Better Sleep",
  "General Fitness",
  "Other",
];

interface Props {
  purposes: OnboardingPurpose[];
  otherPurpose: string;
  errors: { purposes?: string; otherPurpose?: string };
  onToggle: (p: OnboardingPurpose) => void;
  onOtherPurpose: (v: string) => void;
}

export function StepGoals({ purposes, otherPurpose, errors, onToggle, onOtherPurpose }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PURPOSES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onToggle(p)}
            className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium transition-all",
              purposes.includes(p)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {p}
          </button>
        ))}
      </div>
      {errors.purposes && <p className="text-xs text-destructive">{errors.purposes}</p>}

      {purposes.includes("Other") && (
        <div className="space-y-2">
          <Label htmlFor="otherPurpose" className="text-sm font-semibold">
            Please describe your goal
          </Label>
          <Input
            id="otherPurpose"
            placeholder="e.g. Recovering from a sports injury"
            value={otherPurpose}
            onChange={(e) => onOtherPurpose(e.target.value)}
            className={cn(
              "rounded-xl",
              errors.otherPurpose && "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.otherPurpose && (
            <p className="text-xs text-destructive">{errors.otherPurpose}</p>
          )}
        </div>
      )}
    </div>
  );
}
