import { useEffect, useState, useMemo } from "react";
import { fromZonedTime } from "date-fns-tz";
import type { AdminRoom } from "@yoga-app/shared";
import { ApiRequestError } from "@/lib/http";
import { useCreateGroupRoom, useUpdateGroupRoom } from "@/hooks/use-admin";
import { DEFAULT_FORM, type FormState, utcIsoToZonedFields } from "./create-room-dialog-config";

function formFromRoom(room: AdminRoom, tz: string): FormState {
  const { date, time: startTime } = utcIsoToZonedFields(room.scheduledStart, tz);
  const { time: endTime } = utcIsoToZonedFields(room.scheduledEnd, tz);
  return {
    instructorId: room.instructorId,
    name: room.name ?? "",
    date,
    startTime,
    endTime,
    capacity: room.capacity,
    tz,
    meetLink: room.meetLink ?? "",
  };
}

export function useRoomForm(open: boolean, room: AdminRoom | null, onClose: () => void) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const createRoom = useCreateGroupRoom();
  const updateRoom = useUpdateGroupRoom();
  const isEditing = room !== null;

  useEffect(() => {
    if (open) {
      setForm(room ? formFromRoom(room, DEFAULT_FORM.tz) : DEFAULT_FORM);
      setError(null);
      setFieldErrors({});
    } else {
      setForm(DEFAULT_FORM);
      setError(null);
      setFieldErrors({});
    }
  }, [open, room?.id]);

  // Any edit invalidates the previous validation errors — the next submit re-checks everything.
  const patch = (partial: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...partial }));
    setFieldErrors({});
  };

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
    setFieldErrors({});

    if (!form.instructorId) return setFieldErrors({ instructorId: "Please select an instructor." });
    if (!startUtc || !endUtc) return setError("Please fill in date and time.");
    if (endUtc <= startUtc) return setFieldErrors({ scheduledEndUtc: "End time must be after start time." });

    const body = {
      instructorId: form.instructorId,
      name: form.name.trim() || null,
      scheduledStartUtc: startUtc.toISOString(),
      scheduledEndUtc: endUtc.toISOString(),
      capacity: form.capacity,
      meetLink: form.meetLink.trim() || null,
    };

    const mutationOpts = {
      onSuccess: () => onClose(),
      onError: (err: unknown) => {
        // 422s carry a field -> message map — show each error next to its own input
        // instead of one banner that doesn't say which field is wrong.
        if (err instanceof ApiRequestError && err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
          return;
        }
        setError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "create"} class`);
      },
    };

    if (isEditing && room) {
      updateRoom.mutate({ id: room.id, body }, mutationOpts);
    } else {
      createRoom.mutate(body, mutationOpts);
    }
  };

  return {
    form,
    patch,
    error,
    fieldErrors,
    startUtc,
    endUtc,
    handleSubmit,
    isEditing,
    isPending: createRoom.isPending || updateRoom.isPending,
  };
}
