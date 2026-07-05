import { z } from "zod";
import type { InstructorProfile } from "@yoga-app/shared";

export const profileFormSchema = z.object({
  tagline: z.string().max(120, "Max 120 characters"),
  bio: z.string().max(1000, "Max 1000 characters"),
  yearsOfExperience: z
    .string()
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 60),
      "Enter a whole number between 0 and 60",
    ),
  tags: z.array(z.string().max(40)).max(10, "Up to 10 tags"),
  videoLinks: z.array(z.url("Enter a valid URL")).max(5, "Up to 5 video links"),
  profileImageUrl: z.string().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function getProfileFormDefaults(profile: InstructorProfile): ProfileFormValues {
  return {
    tagline: profile.tagline ?? "",
    bio: profile.bio ?? "",
    yearsOfExperience: profile.yearsOfExperience?.toString() ?? "",
    tags: profile.tags ?? [],
    videoLinks: profile.videoLinks ?? [],
    profileImageUrl: profile.profileImageUrl ?? null,
  };
}
