import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { fromZonedTime } from "date-fns-tz";
import type { AdminRoom } from "@yoga-app/shared";
import { ApiRequestError } from "@/lib/http";
import { useCreateGroupRoom, useUpdateGroupRoom } from "@/features/admin/hooks/use-admin";
import { utcIsoToZonedFields } from "./create-room-dialog-config";
import {
  roomFormOptions,
  DEFAULT_ROOM_FORM,
  PUBLIC_ORGANIZATION_VALUE,
  type RoomFormValues,
} from "./room-form-schema";

function formFromRoom(room: AdminRoom, tz: string): RoomFormValues {
  const { date, time: startTime } = utcIsoToZonedFields(room.scheduledStart, tz);
  const { date: endDate, time: endTime } = utcIsoToZonedFields(room.scheduledEnd, tz);
  return {
    instructorId: room.instructorId,
    name: room.name ?? "",
    tz,
    date,
    startTime,
    endDate,
    endTime,
    capacity: room.capacity,
    meetLink: room.meetLink ?? "",
    organizationId: room.organizationId ?? PUBLIC_ORGANIZATION_VALUE,
  };
}

// Backend 422s key errors by request-body field names, which don't line up 1:1
// with our split date/time inputs — map them onto the field that should show the message.
const API_FIELD_MAP: Partial<Record<string, keyof RoomFormValues>> = {
  instructorId: "instructorId",
  name: "name",
  scheduledStartUtc: "startTime",
  scheduledEndUtc: "endTime",
  capacity: "capacity",
  meetLink: "meetLink",
  organizationId: "organizationId",
};

export function useRoomForm(open: boolean, room: AdminRoom | null, onClose: () => void) {
  const form = useForm<RoomFormValues>(roomFormOptions);
  const { reset, watch, setError } = form;
  const [error, setSubmitError] = useState<string | null>(null);
  const createRoom = useCreateGroupRoom();
  const updateRoom = useUpdateGroupRoom();
  const isEditing = room !== null;

  useEffect(() => {
    if (open) {
      reset(room ? formFromRoom(room, DEFAULT_ROOM_FORM.tz) : DEFAULT_ROOM_FORM);
    } else {
      reset(DEFAULT_ROOM_FORM);
    }
    setSubmitError(null);
  }, [open, room?.id, reset]);

  const [date, startTime, endDate, endTime, tz] = watch(["date", "startTime", "endDate", "endTime", "tz"]);

  const { startUtc, endUtc } = useMemo(() => {
    if (!date || !startTime || !endDate || !endTime) return { startUtc: null, endUtc: null };
    try {
      const s = fromZonedTime(`${date}T${startTime}:00`, tz);
      const e = fromZonedTime(`${endDate}T${endTime}:00`, tz);
      return { startUtc: s, endUtc: e };
    } catch {
      return { startUtc: null, endUtc: null };
    }
  }, [date, startTime, endDate, endTime, tz]);

  const onSubmit = (values: RoomFormValues) => {
    setSubmitError(null);
    const start = fromZonedTime(`${values.date}T${values.startTime}:00`, values.tz);
    const end = fromZonedTime(`${values.endDate}T${values.endTime}:00`, values.tz);

    const body = {
      instructorId: values.instructorId,
      name: values.name.trim() || null,
      scheduledStartUtc: start.toISOString(),
      scheduledEndUtc: end.toISOString(),
      capacity: values.capacity,
      meetLink: values.meetLink.trim(),
      organizationId: values.organizationId === PUBLIC_ORGANIZATION_VALUE ? null : values.organizationId,
    };

    const mutationOpts = {
      onSuccess: () => onClose(),
      onError: (err: unknown) => {
        // 422s carry a field -> message map — show each error next to its own input
        // instead of one banner that doesn't say which field is wrong.
        if (err instanceof ApiRequestError && err.fieldErrors) {
          for (const [key, message] of Object.entries(err.fieldErrors)) {
            const field = API_FIELD_MAP[key];
            if (field) setError(field, { message });
          }
          return;
        }
        setSubmitError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "create"} class`);
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
    error,
    startUtc,
    endUtc,
    handleSubmit: form.handleSubmit(onSubmit),
    isEditing,
    isPending: createRoom.isPending || updateRoom.isPending,
  };
}
