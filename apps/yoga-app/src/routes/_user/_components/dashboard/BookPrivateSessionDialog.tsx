import { useState } from "react";
import { CheckCircle2, Info, Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInstructors } from "@/hooks/use-instructors";
import { useBookPrivate } from "@/hooks/use-rooms";

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000; // 2 hours

interface BookPrivateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookPrivateSessionDialog({
  open,
  onOpenChange,
}: BookPrivateSessionDialogProps) {
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {bookedRoomId ? (
          /* Success state */
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="size-14 text-emerald-500 mx-auto" />
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Session booked!</DialogTitle>
              <DialogDescription className="text-center">
                Your private session has been confirmed. Check your email for details.
                Your instructor will also be notified.
              </DialogDescription>
            </DialogHeader>
            <Button className="w-full rounded-xl" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book a Private 1:1 Session</DialogTitle>
              <DialogDescription>
                Choose an instructor and a time that works for you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Instructor selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select instructor</Label>
                {instructors.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                    <Loader2 className="size-4 animate-spin" />
                    Loading instructors…
                  </div>
                ) : allInstructors.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No instructors are available. Please check back later.
                  </p>
                ) : (
                  <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                    {allInstructors.map((instructor) => (
                      <button
                        key={instructor.id}
                        type="button"
                        onClick={() => setSelectedId(instructor.id)}
                        className={[
                          "w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
                          selectedId === instructor.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted/50",
                        ].join(" ")}
                      >
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{instructor.name}</p>
                          {instructor.specialty.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              {instructor.specialty.slice(0, 2).join(" · ")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="session-date" className="text-sm font-semibold">
                  Date
                </Label>
                <Input
                  id="session-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Start time */}
              <div className="space-y-2">
                <Label htmlFor="session-time" className="text-sm font-semibold">
                  Start time <span className="text-muted-foreground font-normal">(your local time)</span>
                </Label>
                <Input
                  id="session-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-xl"
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="size-3 shrink-0" />
                  Must be at least 2 hours from now
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Duration</Label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDuration(opt.value)}
                      className={[
                        "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all",
                        duration === opt.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 text-foreground",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter showCloseButton>
              <Button
                className="rounded-xl font-bold px-6"
                disabled={!isFormValid || bookPrivate.isPending}
                onClick={handleSubmit}
              >
                {bookPrivate.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Booking…
                  </>
                ) : (
                  "Confirm booking"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
