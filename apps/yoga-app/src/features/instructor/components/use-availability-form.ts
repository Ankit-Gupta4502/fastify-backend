import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InstructorProfile } from "@yoga-app/shared";
import { useUpdateInstructorAvailability } from "@/features/instructor/hooks/use-instructors";
import {
  availabilityFormSchema,
  getAvailabilityFormDefaults,
  toAvailabilityPayload,
  type AvailabilityFormValues,
} from "@/features/instructor/schemas";

export function useAvailabilityForm(profile: InstructorProfile) {
  const update = useUpdateInstructorAvailability();
  const [saved, setSaved] = useState(false);

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: getAvailabilityFormDefaults(profile.availability),
  });

  const onSubmit = form.handleSubmit((values) => {
    setSaved(false);
    update.mutate(
      { availability: toAvailabilityPayload(values) },
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
