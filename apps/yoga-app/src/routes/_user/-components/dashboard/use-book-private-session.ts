import { useState } from "react";
import { useRequestPrivate } from "@/hooks/use-rooms";
import { MIN_ADVANCE_MS } from "./book-private-session-config";

export function useBookPrivateSession(onOpenChange: (open: boolean) => void) {
  const requestPrivate = useRequestPrivate();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const isFormValid = !!(date && startTime);

  function resetForm() {
    setDate("");
    setStartTime("");
    setDuration(60);
    setError(null);
    setSubmittedRequestId(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!date || !startTime) return;
    setError(null);

    const startLocal = new Date(`${date}T${startTime}`);
    if (startLocal.getTime() - Date.now() < MIN_ADVANCE_MS) {
      setError("Please schedule at least 2 hours in advance.");
      return;
    }
    const endLocal = new Date(startLocal.getTime() + duration * 60_000);

    requestPrivate.mutate(
      {
        requestedStartUtc: startLocal.toISOString(),
        requestedEndUtc: endLocal.toISOString(),
      },
      {
        onSuccess: (result) => {
          setSubmittedRequestId(result.data?.requestId ?? null);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Request failed. Please try again.");
        },
      },
    );
  }

  return {
    requestPrivate,
    date,
    setDate,
    startTime,
    setStartTime,
    duration,
    setDuration,
    error,
    submittedRequestId,
    isFormValid,
    handleOpenChange,
    handleSubmit,
  };
}
