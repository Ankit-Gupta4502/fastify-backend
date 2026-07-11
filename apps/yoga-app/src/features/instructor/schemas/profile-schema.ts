import { z } from "zod";
import type { InstructorProfile } from "@yoga-app/shared";

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Max 100 characters"),
  tagline: z.string().max(120, "Max 120 characters"),
  bio: z.string().max(1000, "Max 1000 characters"),
  yearsOfExperience: z
    .string()
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 60),
      "Enter a whole number between 0 and 60",
    ),
  tags: z.array(z.string().max(40)).max(10, "Up to 10 tags"),
  introVideoUrl: z.string().nullable(),
  introVideoKey: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function getProfileFormDefaults(profile: InstructorProfile): ProfileFormValues {
  return {
    name: profile.name,
    tagline: profile.tagline ?? "",
    bio: profile.bio ?? "",
    yearsOfExperience: profile.yearsOfExperience?.toString() ?? "",
    tags: profile.tags ?? [],
    introVideoUrl: profile.introVideoUrl ?? null,
    introVideoKey: profile.introVideoKey ?? null,
    profileImageUrl: profile.profileImageUrl ?? null,
  };
}
