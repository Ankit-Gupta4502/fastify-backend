import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/shared/lib/utils";
import type { OnboardingGender } from "@yoga-app/shared";

interface Props {
  gender: OnboardingGender | "";
  phone: string;
  errors: { gender?: string; phone?: string };
  onGender: (g: OnboardingGender) => void;
  onPhone: (p: string) => void;
}

export function StepPersonal({ gender, phone, errors, onGender, onPhone }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Gender</Label>
        <div className="flex gap-3">
          {(["Male", "Female", "Other"] as OnboardingGender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGender(g)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all",
                gender === g
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {g}
            </button>
          ))}
        </div>
        {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Phone Number{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <PhoneInput
          value={phone}
          onChange={onPhone}
          error={Boolean(errors.phone)}
          defaultCountry="in"
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>
    </div>
  );
}
