import { CheckCircle2, Info, Loader2 } from "lucide-react";
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
import { DURATION_OPTIONS } from "./book-private-session-config";
import { useBookPrivateSession } from "./use-book-private-session";
import { InstructorPicker } from "./InstructorPicker";

interface BookPrivateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookPrivateSessionDialog({
  open,
  onOpenChange,
}: BookPrivateSessionDialogProps) {
  const {
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
  } = useBookPrivateSession(onOpenChange);

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
              <InstructorPicker
                isLoading={instructors.isLoading}
                instructors={allInstructors}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />

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
