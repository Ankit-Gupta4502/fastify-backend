import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import { useMyPreferences, useSavePreferences } from "@/hooks/use-user-preferences";
import type {
  OnboardingGender,
  OnboardingPurpose,
  PreferredTimeOfDay,
  SaveUserPreferencesBody,
} from "@yoga-app/shared";

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingPage,
});

const PURPOSES: OnboardingPurpose[] = [
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

const TIME_SLOTS: { value: PreferredTimeOfDay; label: string; sub: string }[] = [
  { value: "Morning",   label: "Morning",   sub: "6 AM – 12 PM" },
  { value: "Afternoon", label: "Afternoon", sub: "12 PM – 5 PM" },
  { value: "Evening",   label: "Evening",   sub: "5 PM – 10 PM" },
  { value: "Flexible",  label: "Flexible",  sub: "Any time works" },
];

type FormState = {
  gender: OnboardingGender | "";
  phone: string;
  purposes: OnboardingPurpose[];
  otherPurpose: string;
  preferredTimeOfDay: PreferredTimeOfDay | "";
  timezone: string;
};

const INITIAL_FORM: FormState = {
  gender: "",
  phone: "",
  purposes: [],
  otherPurpose: "",
  preferredTimeOfDay: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { data: existing, isLoading: checkingExisting } = useMyPreferences();
  const save = useSavePreferences();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Already completed onboarding — send to dashboard
  useEffect(() => {
    if (checkingExisting) return;
    if (existing?.data) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [checkingExisting, existing, navigate]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const togglePurpose = (p: OnboardingPurpose) => {
    setForm((prev) => ({
      ...prev,
      purposes: prev.purposes.includes(p)
        ? prev.purposes.filter((x) => x !== p)
        : [...prev.purposes, p],
    }));
    setErrors((prev) => ({ ...prev, purposes: undefined }));
  };

  const validateStep1 = (): boolean => {
    const errs: typeof errors = {};
    if (!form.gender) errs.gender = "Please select your gender";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length > 3 && digits.length < 7) errs.phone = "Enter a valid phone number";
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const validateStep2 = (): boolean => {
    const errs: typeof errors = {};
    if (form.purposes.length === 0) errs.purposes = "Select at least one goal";
    if (form.purposes.includes("Other") && !form.otherPurpose.trim()) {
      errs.otherPurpose = "Please describe your goal";
    }
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const validateStep3 = (): boolean => {
    const errs: typeof errors = {};
    if (!form.preferredTimeOfDay) errs.preferredTimeOfDay = "Please select a preferred time";
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const handleNext = () => {
    const validators: Record<number, () => boolean> = { 1: validateStep1, 2: validateStep2 };
    if (validators[step]?.()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setServerError(null);

    const body: SaveUserPreferencesBody = {
      gender: form.gender as OnboardingGender,
      phone: form.phone.replace(/\D/g, "").length >= 7 ? form.phone.trim() : null,
      purposes: form.purposes,
      otherPurpose: form.purposes.includes("Other") ? form.otherPurpose.trim() : null,
      preferredTimeOfDay: form.preferredTimeOfDay as PreferredTimeOfDay,
      timezone: form.timezone,
    };

    save.mutate(body, {
      onSuccess: () => void navigate({ to: "/dashboard", replace: true }),
      onError: (err) =>
        setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((s) => (
              <Fragment key={s}>
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={cn("flex-1 h-0.5 transition-all", step > s ? "bg-primary" : "bg-muted")} />
                )}
              </Fragment>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">Step {step} of 3</p>
        </div>

        <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
          {/* Header */}
          <div className="space-y-1 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
              Quick setup
            </p>
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "What are your yoga goals?"}
              {step === 3 && "When do you prefer to practice?"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 && "Help us match you with the right instructor."}
              {step === 2 && "Select all that apply — we'll tailor your experience."}
              {step === 3 && "We'll recommend sessions that fit your schedule."}
            </p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
              {serverError}
            </div>
          )}

          {/* Step 1: Personal info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Gender</Label>
                <div className="flex gap-3">
                  {(["Male", "Female", "Other"] as OnboardingGender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setField("gender", g)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all",
                        form.gender === g
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
                  value={form.phone}
                  onChange={(phone) => setField("phone", phone)}
                  error={Boolean(errors.phone)}
                  defaultCountry="in"
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {PURPOSES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePurpose(p)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                      form.purposes.includes(p)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {errors.purposes && <p className="text-xs text-destructive">{errors.purposes}</p>}

              {form.purposes.includes("Other") && (
                <div className="space-y-2">
                  <Label htmlFor="otherPurpose" className="text-sm font-semibold">
                    Please describe your goal
                  </Label>
                  <Input
                    id="otherPurpose"
                    placeholder="e.g. Recovering from a sports injury"
                    value={form.otherPurpose}
                    onChange={(e) => setField("otherPurpose", e.target.value)}
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
          )}

          {/* Step 3: Preferred time of day */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map(({ value, label, sub }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setField("preferredTimeOfDay", value)}
                    className={cn(
                      "flex flex-col items-start rounded-2xl border px-4 py-3.5 text-left transition-all",
                      form.preferredTimeOfDay === value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className={cn(
                      "text-sm font-semibold",
                      form.preferredTimeOfDay === value ? "text-primary" : "text-foreground",
                    )}>
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>
                  </button>
                ))}
              </div>
              {errors.preferredTimeOfDay && (
                <p className="text-xs text-destructive">{errors.preferredTimeOfDay}</p>
              )}

              <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Your timezone</span>
                <span className="font-semibold text-foreground">{form.timezone}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 pt-2">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setStep((s) => s - 1)}
                disabled={save.isPending}
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button className="flex-1 rounded-xl" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                className="flex-1 rounded-xl"
                onClick={handleSubmit}
                disabled={save.isPending}
              >
                {save.isPending ? "Saving…" : "Complete setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
