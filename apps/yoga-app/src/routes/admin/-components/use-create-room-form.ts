import { useState, useMemo } from "react";
import { fromZonedTime } from "date-fns-tz";
import { useCreateGroupRoom } from "@/hooks/use-admin";
import { DEFAULT_FORM, type FormState } from "./create-room-dialog-config";

export function useCreateRoomForm(onClose: () => void) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const createRoom = useCreateGroupRoom();

  const patch = (partial: Partial<FormState>) => setForm((f) => ({ ...f, ...partial }));

  const { startUtc, endUtc } = useMemo(() => {
    if (!form.date || !form.startTime || !form.endTime) return { startUtc: null, endUtc: null };
    try {
      const s = fromZonedTime(`${form.date}T${form.startTime}:00`, form.tz);
      const e = fromZonedTime(`${form.date}T${form.endTime}:00`, form.tz);
      return { startUtc: s, endUtc: e };
    } catch {
      return { startUtc: null, endUtc: null };
    }
  }, [form.date, form.startTime, form.endTime, form.tz]);

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    setError(null);

    if (!form.instructorId) return setError("Please select an instructor.");
    if (!startUtc || !endUtc) return setError("Please fill in date and time.");
    if (endUtc <= startUtc) return setError("End time must be after start time.");

    createRoom.mutate(
      {
        instructorId: form.instructorId,
        scheduledStartUtc: startUtc.toISOString(),
        scheduledEndUtc: endUtc.toISOString(),
        capacity: form.capacity,
        meetLink: form.meetLink.trim() || null,
      },
      {
        onSuccess: () => {
          setForm(DEFAULT_FORM);
          onClose();
        },
        onError: (err) => setError(err instanceof Error ? err.message : "Failed to create class"),
      },
    );
  };

  return { form, patch, error, startUtc, endUtc, handleSubmit, isPending: createRoom.isPending };
}
