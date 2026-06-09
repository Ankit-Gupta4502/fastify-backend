import { useRef, useState, useEffect, useMemo } from "react";
import type { AdminDemoRequest, DemoRequestStatus, MeetingPlatform } from "@yoga-app/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Check } from "lucide-react";
import {
  useAdminApproveWithSchedule,
  useAdminUpdateDemoStatus,
  useAdminAssignInstructor,
  useAdminScheduleDemoMeeting,
  useAdminCompleteDemoSession,
} from "@/hooks/use-demo";
import type { AdminInstructor } from "@yoga-app/shared";

interface Props {
  request: AdminDemoRequest | null;
  instructors: AdminInstructor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<DemoRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  needs_information: "Needs Info",
  instructor_assigned: "Instructor Assigned",
  meeting_scheduled: "Meeting Scheduled",
  completed: "Completed",
};

const PLATFORM_OPTIONS: { value: MeetingPlatform; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "teams", label: "Microsoft Teams" },
];

// ── Instructor combobox ───────────────────────────────────────────────────────

interface InstructorComboboxProps {
  instructors: AdminInstructor[];
  value: string;
  onChange: (id: string) => void;
}

function InstructorCombobox({ instructors, value, onChange }: InstructorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = instructors.find((i) => i.id === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((i) => i.name.toLowerCase().includes(q));
  }, [search, instructors]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm",
          "hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
          !selected && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selected ? selected.name : "Select an instructor…"}</span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground flex-none transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2.5 py-1.5">
              <Search className="size-3.5 text-muted-foreground flex-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructor…"
                className="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="max-h-44 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-center text-muted-foreground">No instructors found</p>
            ) : (
              filtered.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => { onChange(i.id); setOpen(false); setSearch(""); }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                    "hover:bg-muted/50",
                    value === i.id && "bg-primary/10 text-primary",
                  )}
                >
                  <span className="flex-1 truncate text-xs">{i.name}</span>
                  {value === i.id && <Check className="size-3.5 flex-none" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────

export function ReviewDemoDialog({ request, instructors, open, onOpenChange }: Props) {
  const approveWithSchedule = useAdminApproveWithSchedule();
  const updateStatus = useAdminUpdateDemoStatus();
  const assignInstructor = useAdminAssignInstructor();
  const scheduleMeeting = useAdminScheduleDemoMeeting();
  const completeSession = useAdminCompleteDemoSession();

  const [rejectionReason, setRejectionReason] = useState("");
  const [needsInfoMessage, setNeedsInfoMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("google_meet");
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "review" | "approve" | "assign" | "meeting" | null
  >(null);

  if (!request) return null;

  const isLoading =
    approveWithSchedule.isPending ||
    updateStatus.isPending ||
    assignInstructor.isPending ||
    scheduleMeeting.isPending ||
    completeSession.isPending;

  const close = () => {
    onOpenChange(false);
    setError(null);
    setActiveSection(null);
    setRejectionReason("");
    setNeedsInfoMessage("");
    setAdminNotes("");
    setSelectedInstructorId("");
    setMeetingLink("");
    setMeetingPlatform("google_meet");
  };

  const handleApproveWithSchedule = () => {
    if (!selectedInstructorId) { setError("Please select an instructor"); return; }
    if (!meetingLink.trim()) { setError("Meeting link is required"); return; }
    setError(null);
    approveWithSchedule.mutate(
      {
        id: request.id,
        body: {
          instructorId: selectedInstructorId,
          meetingLink: meetingLink.trim(),
          meetingPlatform,
          adminNotes: adminNotes.trim() || undefined,
        },
      },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof Error ? err.message : "Action failed"),
      },
    );
  };

  const handleStatusUpdate = (status: "approved" | "rejected" | "needs_information") => {
    setError(null);
    updateStatus.mutate(
      {
        id: request.id,
        body: {
          status,
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
          needsInfoMessage: status === "needs_information" ? needsInfoMessage : undefined,
          adminNotes: adminNotes || undefined,
        },
      },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof Error ? err.message : "Action failed"),
      },
    );
  };

  const handleAssign = () => {
    if (!selectedInstructorId) { setError("Please select an instructor"); return; }
    setError(null);
    assignInstructor.mutate(
      { id: request.id, body: { instructorId: selectedInstructorId } },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof Error ? err.message : "Action failed"),
      },
    );
  };

  const handleScheduleMeeting = () => {
    if (!meetingLink.trim()) { setError("Meeting link is required"); return; }
    setError(null);
    scheduleMeeting.mutate(
      { id: request.id, body: { meetingLink: meetingLink.trim(), meetingPlatform } },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof Error ? err.message : "Action failed"),
      },
    );
  };

  const handleComplete = () => {
    setError(null);
    completeSession.mutate(request.id, {
      onSuccess: close,
      onError: (err) => setError(err instanceof Error ? err.message : "Action failed"),
    });
  };

  const approvedInstructors = instructors.filter((i) => i.isApproved);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Demo Request — {request.userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <Badge className="text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5">
              {STATUS_LABELS[request.status]}
            </Badge>
          </div>

          {/* User details */}
          <Section title="User Details">
            <InfoRow label="Email" value={request.userEmail} />
            <InfoRow label="Phone" value={request.phone} />
            <InfoRow label="Gender" value={request.gender} />
            <InfoRow label="Timezone" value={request.timezone} />
            <InfoRow label="Goals" value={request.purposes.join(", ")} />
            {request.otherPurpose && (
              <InfoRow label="Other Goal" value={request.otherPurpose} />
            )}
          </Section>

          {/* Schedule */}
          <Section title="Preferred Schedule">
            <InfoRow label="Date" value={request.preferredDate} />
            <InfoRow
              label="Time (Local)"
              value={`${request.preferredTime} (${request.timezone})`}
            />
            <InfoRow label="IST Time" value={request.istTime} />
          </Section>

          {/* Assignment info if present */}
          {request.assignedInstructor && (
            <Section title="Instructor">
              <InfoRow label="Name" value={request.assignedInstructor.name} />
              <InfoRow label="Email" value={request.assignedInstructor.email} />
            </Section>
          )}

          {request.meetingLink && (
            <Section title="Meeting">
              <InfoRow label="Platform" value={request.meetingPlatform ?? ""} />
              <InfoRow
                label="Link"
                value={
                  <a
                    href={request.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-xs break-all"
                  >
                    {request.meetingLink}
                  </a>
                }
              />
            </Section>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* ── Actions ──────────────────────────────────────────────────── */}

          {/* Pending / needs_information → approve (with instructor + meeting) or reject */}
          {(request.status === "pending" || request.status === "needs_information") && (
            <div className="space-y-3 pt-2">
              {activeSection === null && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl flex-1"
                    disabled={isLoading}
                    onClick={() => setActiveSection("approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl flex-1"
                    disabled={isLoading}
                    onClick={() => setActiveSection("review")}
                  >
                    Reject / Needs Info
                  </Button>
                </div>
              )}

              {/* Approve form: instructor + meeting details */}
              {activeSection === "approve" && (
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Approve & Schedule
                  </p>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Instructor <span className="text-destructive">*</span>
                    </Label>
                    <InstructorCombobox
                      instructors={approvedInstructors}
                      value={selectedInstructorId}
                      onChange={setSelectedInstructorId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Meeting Platform <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      {PLATFORM_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMeetingPlatform(opt.value)}
                          className={cn(
                            "flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
                            meetingPlatform === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Meeting Link <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="https://meet.google.com/…"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Admin Notes (optional)</Label>
                    <Input
                      placeholder="Internal notes…"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full rounded-xl"
                    disabled={isLoading || !selectedInstructorId || !meetingLink.trim()}
                    onClick={handleApproveWithSchedule}
                  >
                    {approveWithSchedule.isPending
                      ? "Approving…"
                      : "Approve & Schedule Meeting"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full rounded-xl text-muted-foreground"
                    onClick={() => { setActiveSection(null); setError(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Reject / Needs Info form */}
              {activeSection === "review" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Rejection Reason</Label>
                    <Input
                      placeholder="Required if rejecting…"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full rounded-xl"
                      disabled={isLoading || !rejectionReason.trim()}
                      onClick={() => handleStatusUpdate("rejected")}
                    >
                      {updateStatus.isPending ? "Rejecting…" : "Reject Request"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Request More Information</Label>
                    <Input
                      placeholder="What information do you need?"
                      value={needsInfoMessage}
                      onChange={(e) => setNeedsInfoMessage(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl"
                      disabled={isLoading || !needsInfoMessage.trim()}
                      onClick={() => handleStatusUpdate("needs_information")}
                    >
                      {updateStatus.isPending ? "Sending…" : "Request Info"}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full rounded-xl text-muted-foreground"
                    onClick={() => { setActiveSection(null); setError(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Approved → assign instructor (fallback for already-approved requests) */}
          {request.status === "approved" && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold">Assign Instructor</Label>
              <InstructorCombobox
                instructors={approvedInstructors}
                value={selectedInstructorId}
                onChange={setSelectedInstructorId}
              />
              <Button
                size="sm"
                className="w-full rounded-xl"
                disabled={isLoading || !selectedInstructorId}
                onClick={handleAssign}
              >
                {assignInstructor.isPending ? "Assigning…" : "Assign Instructor"}
              </Button>
            </div>
          )}

          {/* Instructor assigned → schedule meeting */}
          {request.status === "instructor_assigned" && (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Meeting Platform</Label>
                <div className="flex gap-2">
                  {PLATFORM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMeetingPlatform(opt.value)}
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
                        meetingPlatform === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Meeting Link</Label>
                <Input
                  placeholder="https://meet.google.com/…"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="rounded-xl text-sm"
                />
              </div>

              <Button
                size="sm"
                className="w-full rounded-xl"
                disabled={isLoading || !meetingLink.trim()}
                onClick={handleScheduleMeeting}
              >
                {scheduleMeeting.isPending ? "Scheduling…" : "Schedule Meeting"}
              </Button>
            </div>
          )}

          {/* Meeting scheduled → mark completed */}
          {request.status === "meeting_scheduled" && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-xl"
                disabled={isLoading}
                onClick={handleComplete}
              >
                {completeSession.isPending ? "Marking…" : "Mark as Completed"}
              </Button>
            </div>
          )}

          <div className="pt-1">
            <Button
              variant="ghost"
              className="w-full rounded-xl text-muted-foreground"
              onClick={close}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
      <div className="px-4 py-2 border-b border-border/40 bg-muted/40">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="text-muted-foreground font-medium shrink-0 text-xs">{label}</dt>
      <dd className="font-semibold text-foreground text-right text-xs">{value}</dd>
    </div>
  );
}
