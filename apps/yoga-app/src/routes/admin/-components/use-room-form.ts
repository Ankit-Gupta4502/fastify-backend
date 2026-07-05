import { useEffect, useState, useMemo } from "react";
import { fromZonedTime } from "date-fns-tz";
import type { AdminRoom } from "@yoga-app/shared";
import { useCreateGroupRoom, useUpdateGroupRoom } from "@/hooks/use-admin";
import { DEFAULT_FORM, type FormState, utcIsoToZonedFields } from "./create-room-dialog-config";

function formFromRoom(room: AdminRoom, tz: string): FormState {
  const { date, time: startTime } = utcIsoToZonedFields(room.scheduledStart, tz);
  const { time: endTime } = utcIsoToZonedFields(room.scheduledEnd, tz);
  return {
    instructorId: room.instructorId,
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
  const createRoom = useCreateGroupRoom();
  const updateRoom = useUpdateGroupRoom();
  const isEditing = room !== null;

  useEffect(() => {
    if (open) {
      setForm(room ? formFromRoom(room, DEFAULT_FORM.tz) : DEFAULT_FORM);
      setError(null);
    } else {
      setForm(DEFAULT_FORM);
      setError(null);
    }
  }, [open, room?.id]);

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

    const body = {
      instructorId: form.instructorId,
      scheduledStartUtc: startUtc.toISOString(),
      scheduledEndUtc: endUtc.toISOString(),
      capacity: form.capacity,
      meetLink: form.meetLink.trim() || null,
    };

    const mutationOpts = {
      onSuccess: () => onClose(),
      onError: (err: unknown) =>
        setError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "create"} class`),
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
    startUtc,
    endUtc,
    handleSubmit,
    isEditing,
    isPending: createRoom.isPending || updateRoom.isPending,
  };
}
