import { useRef, useState } from "react";
import { useCreateWorkshop, useUpdateWorkshop } from "@/hooks/use-workshops";
import { useUploadAttachment } from "@/hooks/use-instructors";
import type { AdminWorkshop, CreateWorkshopBody } from "@yoga-app/shared";

export const EMPTY_WORKSHOP: CreateWorkshopBody = {
  name: "",
  description: "",
  priceInr: null,
  priceUsd: null,
  image: null,
  meetLink: "",
  scheduledAt: null,
  maxAttendees: 50,
  isActive: false,
};

export function useWorkshopDialogForm(
  initial: AdminWorkshop | null,
  onClose: () => void,
) {
  const create = useCreateWorkshop();
  const update = useUpdateWorkshop();
  const upload = useUploadAttachment();
  const fileRef = useRef<HTMLInputElement>(null);
  const isPending = create.isPending || update.isPending;

  const [form, setForm] = useState<CreateWorkshopBody>(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          priceInr: initial.priceInr,
          priceUsd: initial.priceUsd,
          image: initial.image ?? null,
          meetLink: initial.meetLink ?? "",
          scheduledAt: initial.scheduledAt
            ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
            : "",
          maxAttendees: initial.maxAttendees,
          isActive: initial.isActive,
        }
      : EMPTY_WORKSHOP,
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateWorkshopBody>(k: K, v: CreateWorkshopBody[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    upload.mutate(file, {
      onSuccess: (res) => set("image", res.data.url),
      onError: (err) => setError(err instanceof Error ? err.message : "Image upload failed"),
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required.");
      return;
    }
    setError(null);

    const body: CreateWorkshopBody = {
      ...form,
      meetLink: form.meetLink?.toString().trim() || null,
      scheduledAt: form.scheduledAt
        ? new Date(form.scheduledAt as string).toISOString()
        : null,
    };

    if (initial) {
      update.mutate(
        { id: initial.id, body },
        { onSuccess: onClose, onError: (e) => setError(e instanceof Error ? e.message : "Update failed") },
      );
    } else {
      create.mutate(body, {
        onSuccess: onClose,
        onError: (e) => setError(e instanceof Error ? e.message : "Create failed"),
      });
    }
  };

  return { form, error, isPending, upload, fileRef, set, handleImageSelect, handleSubmit };
}
