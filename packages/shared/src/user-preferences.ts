export type OnboardingGender = "Male" | "Female" | "Other";

export type OnboardingPurpose =
  | "Pregnancy"
  | "Stress Relief"
  | "Anxiety Management"
  | "Flexibility Improvement"
  | "Weight Loss"
  | "Back Pain Relief"
  | "Better Sleep"
  | "General Fitness"
  | "Other";

export type PreferredTimeOfDay = "Morning" | "Afternoon" | "Evening" | "Flexible";

export interface UserPreferences {
  userId: string;
  gender: OnboardingGender;
  phone: string | null;
  purposes: OnboardingPurpose[];
  otherPurpose: string | null;
  preferredTimeOfDay: PreferredTimeOfDay | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveUserPreferencesBody {
  gender: OnboardingGender;
  phone?: string | null;
  purposes: OnboardingPurpose[];
  otherPurpose?: string | null;
  preferredTimeOfDay?: PreferredTimeOfDay | null;
  timezone: string;
}
