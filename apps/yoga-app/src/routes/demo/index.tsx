import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSubmitDemoRequest, useMyDemoRequests } from "@/hooks/use-demo";
import type {
  CreateDemoRequestBody,
  DemoGender,
  DemoPurpose,
} from "@yoga-app/shared";
import { ApiRequestError } from "@/lib/http";

export const Route = createFileRoute("/demo/")({
  component: DemoOnboardingPage,
});

const PURPOSES: DemoPurpose[] = [
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

type FormState = {
  gender: DemoGender | "";
  phone: string;
  purposes: DemoPurpose[];
  otherPurpose: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
};

const INITIAL_FORM: FormState = {
  gender: "",
  phone: "",
  purposes: [],
  otherPurpose: "",
  preferredDate: "",
  preferredTime: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

function DemoOnboardingPage() {
  const navigate = useNavigate();
  const { data: existing, isLoading: checkingExisting } = useMyDemoRequests();
  const submit = useSubmitDemoRequest();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // If user already has an active request, redirect to success/status page
  const activeRequest = existing?.data?.find((r) =>
    ["pending", "approved", "instructor_assigned", "meeting_scheduled"].includes(r.status),
  );

  if (!checkingExisting && activeRequest) {
    void navigate({ to: "/demo/success", search: { id: activeRequest.id } });
    return null;
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const togglePurpose = (p: DemoPurpose) => {
    setForm((prev) => ({
      ...prev,
      purposes: prev.purposes.includes(p)
        ? prev.purposes.filter((x) => x !== p)
        : [...prev.purposes, p],
    }));
    setErrors((prev) => ({ ...prev, purposes: undefined }));
  };

  // ── Step validation ───────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const errs: typeof errors = {};
    if (!form.gender) errs.gender = "Please select your gender";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (form.phone.trim().length < 7) errs.phone = "Enter a valid phone number";
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
    if (!form.preferredDate) errs.preferredDate = "Please select a date";
    if (!form.preferredTime) errs.preferredTime = "Please select a time";
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const handleNext = () => {
    const validators: Record<number, () => boolean> = {
      1: validateStep1,
      2: validateStep2,
    };
    if (validators[step]?.()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setServerError(null);
    const body: CreateDemoRequestBody = {
      gender: form.gender as DemoGender,
      phone: form.phone.trim(),
      purposes: form.purposes,
      otherPurpose: form.purposes.includes("Other") ? form.otherPurpose.trim() : undefined,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      timezone: form.timezone,
    };

    submit.mutate(body, {
      onSuccess: (res) => {
        localStorage.removeItem("demoClassIntent");
        void navigate({ to: "/demo/success", search: { id: res.data?.id ?? "" } });
      },
      onError: (err) => {
        if (err instanceof ApiRequestError && err.status === 409) {
          setServerError("You already have an active demo request. Redirecting to your status…");
          setTimeout(() => void navigate({ to: "/demo/success", search: { id: "" } }), 1500);
        } else {
          setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
      },
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 w-32 transition-all",
                      step > s ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">Step {step} of 3</p>
        </div>

        <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
          {/* Header */}
          <div className="space-y-1 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
              Free Demo Class
            </p>
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "What are your yoga goals?"}
              {step === 3 && "When works best for you?"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 && "Help us match you with the right instructor."}
              {step === 2 && "Select all that apply — we'll tailor the session."}
              {step === 3 && "We'll schedule your session around your availability."}
            </p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
              {serverError}
            </div>
          )}

          {/* ── Step 1: Personal info ───────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Gender</Label>
                <div className="flex gap-3">
                  {(["Male", "Female", "Other"] as DemoGender[]).map((g) => (
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
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className={cn(
                    "rounded-xl",
                    errors.phone && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Include your country code (e.g. +91, +1)
                </p>
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Goals ────────────────────────────────────────────── */}
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
              {errors.purposes && (
                <p className="text-xs text-destructive">{errors.purposes}</p>
              )}

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
                      errors.otherPurpose &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {errors.otherPurpose && (
                    <p className="text-xs text-destructive">{errors.otherPurpose}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Schedule ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold">
                  Preferred Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={form.preferredDate}
                  onChange={(e) => setField("preferredDate", e.target.value)}
                  className={cn(
                    "rounded-xl",
                    errors.preferredDate &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.preferredDate && (
                  <p className="text-xs text-destructive">{errors.preferredDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-semibold">
                  Preferred Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={form.preferredTime}
                  onChange={(e) => setField("preferredTime", e.target.value)}
                  className={cn(
                    "rounded-xl",
                    errors.preferredTime &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.preferredTime && (
                  <p className="text-xs text-destructive">{errors.preferredTime}</p>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Your timezone</span>
                <span className="font-semibold text-foreground">{form.timezone}</span>
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setStep((s) => s - 1)}
                disabled={submit.isPending}
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
                disabled={submit.isPending}
              >
                {submit.isPending ? "Submitting…" : "Book My Free Class"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
