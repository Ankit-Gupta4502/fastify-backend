import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyPreferences, useSavePreferences } from "@/hooks/use-user-preferences";
import { StepPersonal } from "../-components/edit-profile/StepPersonal";
import { StepGoals } from "../-components/edit-profile/StepGoals";
import type { OnboardingGender, OnboardingPurpose, SaveUserPreferencesBody } from "@yoga-app/shared";

export const Route = createFileRoute("/_user/edit-profile/")({
  component: EditProfilePage,
});

type FormState = {
  gender: OnboardingGender | "";
  phone: string;
  purposes: OnboardingPurpose[];
  otherPurpose: string;
};

const INITIAL_FORM: FormState = { gender: "", phone: "", purposes: [], otherPurpose: "" };

export function EditProfilePage() {
  const navigate = useNavigate();
  const { data: existing, isLoading: checkingExisting } = useMyPreferences();
  const save = useSavePreferences();
  const isEditing = Boolean(existing?.data);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const prefs = existing?.data;
    if (!prefs) return;
    setForm({
      gender: (prefs.gender as OnboardingGender) ?? "",
      phone: prefs.phone ?? "",
      purposes: (prefs.purposes as OnboardingPurpose[]) ?? [],
      otherPurpose: prefs.otherPurpose ?? "",
    });
  }, [existing?.data]);

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

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.gender) errs.gender = "Please select your gender";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length > 3 && digits.length < 7) errs.phone = "Enter a valid phone number";
    if (form.purposes.length === 0) errs.purposes = "Select at least one goal";
    if (form.purposes.includes("Other") && !form.otherPurpose.trim()) {
      errs.otherPurpose = "Please describe your goal";
    }
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setServerError(null);

    const body: SaveUserPreferencesBody = {
      gender: form.gender as OnboardingGender,
      phone: form.phone.replace(/\D/g, "").length >= 7 ? form.phone.trim() : null,
      purposes: form.purposes,
      otherPurpose: form.purposes.includes("Other") ? form.otherPurpose.trim() : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    save.mutate(body, {
      onSuccess: () => void navigate({ to: "/dashboard", replace: true }),
      onError: (err) =>
        setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
    });
  };

  return (
    <div className="min-h-full  px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Leaf className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              {isEditing ? "Edit Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing ? "Update your details below." : "Help us personalise your experience."}
            </p>
          </div>
        </div>

        {checkingExisting ? (
          <div className="py-20 flex items-center justify-center">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">

            {/* About you */}
            <div className="px-6 pt-6 pb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">About you</p>
              <StepPersonal
                gender={form.gender}
                phone={form.phone}
                errors={{ gender: errors.gender, phone: errors.phone }}
                onGender={(g) => setField("gender", g)}
                onPhone={(p) => setField("phone", p)}
              />
            </div>

            <div className="h-px bg-border/60 mx-6" />

            {/* Goals */}
            <div className="px-6 pt-5 pb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Your yoga goals</p>
              <StepGoals
                purposes={form.purposes}
                otherPurpose={form.otherPurpose}
                errors={{ purposes: errors.purposes, otherPurpose: errors.otherPurpose }}
                onToggle={togglePurpose}
                onOtherPurpose={(v) => setField("otherPurpose", v)}
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 space-y-3">
              {serverError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
                  {serverError}
                </div>
              )}
              <Button
                className="w-full rounded-xl h-11 font-semibold"
                onClick={handleSubmit}
                disabled={save.isPending}
              >
                {save.isPending ? "Saving…" : isEditing ? "Save changes" : "Save profile"}
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
