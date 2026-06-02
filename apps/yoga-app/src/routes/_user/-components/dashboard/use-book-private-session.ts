import { useState } from "react";
import { useInstructors } from "@/hooks/use-instructors";
import { useBookPrivate } from "@/hooks/use-rooms";
import { MIN_ADVANCE_MS } from "./book-private-session-config";

export function useBookPrivateSession(onOpenChange: (open: boolean) => void) {
  const instructors = useInstructors();
  const bookPrivate = useBookPrivate();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [bookedRoomId, setBookedRoomId] = useState<string | null>(null);

  const allInstructors = instructors.data?.data ?? [];
  const isFormValid = selectedId && date && startTime;

  function resetForm() {
    setSelectedId(null);
    setDate("");
    setStartTime("");
    setDuration(60);
    setError(null);
    setBookedRoomId(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!selectedId || !date || !startTime) return;
    setError(null);

    const startLocal = new Date(`${date}T${startTime}`);
    if (startLocal.getTime() - Date.now() < MIN_ADVANCE_MS) {
      setError("Please schedule at least 2 hours in advance.");
      return;
    }
    const endLocal = new Date(startLocal.getTime() + duration * 60_000);

    bookPrivate.mutate(
      {
        instructorId: selectedId,
        startUtc: startLocal.toISOString(),
        endUtc: endLocal.toISOString(),
      },
      {
        onSuccess: (result) => {
          setBookedRoomId(result.data?.roomId ?? null);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
        },
      },
    );
  }

  return {
    instructors,
    allInstructors,
    bookPrivate,
    selectedId,
    setSelectedId,
    date,
    setDate,
    startTime,
    setStartTime,
    duration,
    setDuration,
    error,
    bookedRoomId,
    isFormValid,
    handleOpenChange,
    handleSubmit,
  };
}
