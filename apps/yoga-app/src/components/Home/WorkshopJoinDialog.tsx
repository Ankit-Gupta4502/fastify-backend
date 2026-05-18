import { useState } from "react";
import { X, CalendarDays, Users, Video, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinWorkshop } from "@/hooks/use-workshops";
import { formatCompact, userTimezone } from "@/lib/timezone";
import type { Workshop } from "@yoga-app/shared";

interface Props {
  workshop: Workshop;
  onClose: () => void;
}

export function WorkshopJoinDialog({ workshop: w, onClose }: Props) {
  const tz = userTimezone();
  const join = useJoinWorkshop();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spotsLeft = w.maxAttendees - w.attendeeCount;
  const full = spotsLeft <= 0;

  const handleJoin = () => {
    if (!name.trim() || !email.trim()) return;
    setError(null);
    join.mutate(
      { id: w.id, body: { name: name.trim(), email: email.trim() } },
      {
        onSuccess: () => setDone(true),
        onError: (err) => setError(err instanceof Error ? err.message : "Could not register"),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/40">
          <div className="space-y-1 pr-4">
            <h2 className="text-lg font-bold leading-snug">{w.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {w.scheduledAt && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5 text-primary" />
                  {formatCompact(w.scheduledAt, tz)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {full ? (
                  <span className="text-destructive font-medium">Full</span>
                ) : (
                  <span><span className="font-semibold text-foreground">{spotsLeft}</span> spots left</span>
                )}
              </span>
              {w.meetLink && (
                <span className="flex items-center gap-1">
                  <Video className="size-3.5 text-primary" />
                  Google Meet
                </span>
              )}
              {(w.price === null || w.price === 0) ? (
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5">FREE</span>
              ) : (
                <span className="font-bold text-foreground">₹{(w.price / 100).toFixed(0)}</span>
              )}
            </div>
          </div>
          <Button size="icon-sm" variant="ghost" className="rounded-xl shrink-0" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{w.description}</p>

          {done ? (
            <div className="flex items-center gap-2.5 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl px-4 py-4">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="font-semibold">You're registered!</p>
                <p className="text-xs font-normal text-emerald-600/80 mt-0.5">Check your email for details.</p>
              </div>
            </div>
          ) : full ? (
            <p className="text-sm text-center text-muted-foreground bg-secondary/40 rounded-2xl px-4 py-4">
              This workshop is full. Check back for future events.
            </p>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="rounded-xl"
              />
              {error && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                className="w-full rounded-xl gap-2"
                disabled={join.isPending || !name.trim() || !email.trim()}
                onClick={handleJoin}
              >
                {join.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Registering…</>
                ) : (
                  <>Reserve My Spot <ArrowRight className="size-4" /></>
                )}
              </Button>
            </div>
          )}
        </div>

        {done && (
          <div className="px-6 pb-6">
            <Button variant="outline" className="w-full rounded-xl" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
