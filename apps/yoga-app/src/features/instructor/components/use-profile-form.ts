import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InstructorProfile } from "@yoga-app/shared";
import { useUpdateInstructorProfile } from "@/features/instructor/hooks/use-instructors";
import {
  profileFormSchema,
  getProfileFormDefaults,
  type ProfileFormValues,
} from "@/features/instructor/schemas";

export function useProfileForm(profile: InstructorProfile) {
  const update = useUpdateInstructorProfile();
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getProfileFormDefaults(profile),
  });

  const onSubmit = form.handleSubmit((values) => {
    setSaved(false);
    update.mutate(
      {
        name: values.name.trim(),
        bio: values.bio || undefined,
        tagline: values.tagline || undefined,
        profileImageUrl: values.profileImageUrl,
        avatarKey: null,
        introVideoUrl: values.introVideoUrl,
        introVideoKey: values.introVideoKey,
        tags: values.tags,
        yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : null,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
      },
    );
  });

  return {
    form,
    onSubmit,
    saved,
    isSaving: update.isPending,
    saveError: update.isError
      ? update.error instanceof Error
        ? update.error.message
        : "Save failed"
      : null,
  };
}
