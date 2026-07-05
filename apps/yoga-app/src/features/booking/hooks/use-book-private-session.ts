import { useState, useMemo } from "react";
import { useRequestPrivate } from "@/features/booking/hooks/use-rooms";
import { useMyPlan } from "@/features/payments/hooks/use-plans";
import {
  DURATION_OPTIONS,
  MIN_ADVANCE_MS,
  MAX_SLOTS_MANUAL,
  MAX_SLOTS_RECURRING,
} from "@/features/booking/constants/book-private-session-config";

export type TabMode = "manual" | "recurring";

export interface SlotEntry {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  duration: number;   // minutes
}

export interface RecurringConfig {
  days: number[];     // 0=Sun … 6=Sat
  startTime: string;
  duration: number;
  fromDate: string;
  toDate: string;
}

function emptySlot(): SlotEntry {
  return { date: "", startTime: "", duration: 60 };
}

function emptyRecurring(): RecurringConfig {
  return { days: [], startTime: "", duration: 60, fromDate: "", toDate: "" };
}

function validateSlot(slot: SlotEntry): string | null {
  if (!slot.date || !slot.startTime) return null;
  const start = new Date(`${slot.date}T${slot.startTime}`);
  if (start.getTime() - Date.now() < MIN_ADVANCE_MS) {
    return "Must be at least 2 hours from now";
  }
  return null;
}

export function generateRecurringSlots(config: RecurringConfig, limit: number): SlotEntry[] {
  const { days, startTime, duration, fromDate, toDate } = config;
  if (!days.length || !startTime || !fromDate || !toDate) return [];
  if (toDate < fromDate) return [];

  const slots: SlotEntry[] = [];
  const [fy, fm, fd] = fromDate.split("-").map(Number);
  const [ty, tm, td] = toDate.split("-").map(Number);
  const end = new Date(ty, tm - 1, td);
  const current = new Date(fy, fm - 1, fd);

  while (current <= end && slots.length < limit) {
    if (days.includes(current.getDay())) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      slots.push({ date: `${y}-${m}-${d}`, startTime, duration });
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
}

export function useBookPrivateSession(onOpenChange: (open: boolean) => void) {
  const requestPrivate = useRequestPrivate();
  const { data: myPlanData } = useMyPlan();

  const activeSubs = myPlanData?.data ?? [];
  const privateCapableSub = activeSubs.find((s) => s.plan.allowsPrivate);
  const sessionsLeft =
    privateCapableSub?.sessionsTotal != null
      ? Math.max(0, privateCapableSub.sessionsTotal - privateCapableSub.sessionsUsed)
      : MAX_SLOTS_RECURRING;
  const recurringLimit = Math.min(MAX_SLOTS_RECURRING, sessionsLeft);

  const [activeTab, setActiveTab] = useState<TabMode>("manual");

  // ── Manual ────────────────────────────────────────────────────────────────
  const [manualSlots, setManualSlots] = useState<SlotEntry[]>([emptySlot()]);

  function addManualSlot() {
    if (manualSlots.length < MAX_SLOTS_MANUAL)
      setManualSlots((p) => [...p, emptySlot()]);
  }
  function removeManualSlot(i: number) {
    setManualSlots((p) => p.filter((_, idx) => idx !== i));
  }
  function updateManualSlot(i: number, patch: Partial<SlotEntry>) {
    setManualSlots((p) => p.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  // ── Recurring ─────────────────────────────────────────────────────────────
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>(emptyRecurring());
  const [removedRecurringDates, setRemovedRecurringDates] = useState<Set<string>>(new Set());

  // Always derived from current config + limit so plan data loading async is handled correctly
  const allRecurringSlots = useMemo(
    () => generateRecurringSlots(recurringConfig, recurringLimit),
    [recurringConfig, recurringLimit],
  );
  const recurringSlots = useMemo(
    () => allRecurringSlots.filter((s) => !removedRecurringDates.has(s.date)),
    [allRecurringSlots, removedRecurringDates],
  );

  function updateRecurring(patch: Partial<RecurringConfig>) {
    setRemovedRecurringDates(new Set());
    setRecurringConfig((prev) => ({ ...prev, ...patch }));
  }
  function removeRecurringSlot(i: number) {
    const slot = recurringSlots[i];
    if (slot) setRemovedRecurringDates((prev) => new Set([...prev, slot.date]));
  }

  // ── Shared ────────────────────────────────────────────────────────────────
  const activeSlots = activeTab === "manual" ? manualSlots : recurringSlots;

  const isFormValid =
    activeTab === "manual"
      ? manualSlots.length > 0 && manualSlots.every((s) => s.date && s.startTime)
      : recurringSlots.length > 0;

  const [error, setError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  function resetForm() {
    setActiveTab("manual");
    setManualSlots([emptySlot()]);
    setRecurringConfig(emptyRecurring());
    setRemovedRecurringDates(new Set());
    setError(null);
    setSubmittedRequestId(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit() {
    setError(null);

    if (activeTab === "manual") {
      for (let i = 0; i < manualSlots.length; i++) {
        const err = validateSlot(manualSlots[i]);
        if (err) { setError(`Session ${i + 1}: ${err}`); return; }
      }
    }

    if (activeSlots.length === 0) {
      setError("Add at least one session before submitting.");
      return;
    }

    const apiSlots = activeSlots.map((s) => {
      const start = new Date(`${s.date}T${s.startTime}`);
      const end = new Date(start.getTime() + s.duration * 60_000);
      return { startUtc: start.toISOString(), endUtc: end.toISOString() };
    });

    requestPrivate.mutate(
      { slots: apiSlots },
      {
        onSuccess: (result) => setSubmittedRequestId(result.data?.requestId ?? null),
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Request failed. Please try again."),
      },
    );
  }

  return {
    requestPrivate,
    activeTab, setActiveTab,
    manualSlots, addManualSlot, removeManualSlot, updateManualSlot,
    maxManualSlots: MAX_SLOTS_MANUAL,
    recurringConfig, updateRecurring, recurringSlots, removeRecurringSlot,
    recurringLimit, sessionsLeft,
    error, submittedRequestId, isFormValid,
    handleOpenChange, handleSubmit,
    durationOptions: DURATION_OPTIONS,
  };
}
