import type { AdminDemoRequest, AdminInstructor, MeetingPlatform } from "@yoga-app/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { DemoStatusChip } from "./demo-status-chip";
import { InstructorCombobox } from "./instructor-combobox";
import { useReviewDemoDialog } from "./use-review-demo-dialog";

interface Props {
  request: AdminDemoRequest | null;
  instructors: AdminInstructor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLATFORM_OPTIONS: { value: MeetingPlatform; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "teams", label: "Microsoft Teams" },
];

export function ReviewDemoDialog({ request, instructors, open, onOpenChange }: Props) {
  const form = useReviewDemoDialog(request, () => onOpenChange(false));

  if (!request) return null;

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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <DemoStatusChip status={request.status} />
          </div>

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

          <Section title="Preferred Schedule">
            <InfoRow label="Date" value={request.preferredDate} />
            <InfoRow
              label="Time (Local)"
              value={`${request.preferredTime} (${request.timezone})`}
            />
            <InfoRow label="IST Time" value={request.istTime} />
          </Section>

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

          {form.error && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-2.5">
              {form.error}
            </p>
          )}

          {/* Pending / needs_information → approve or reject */}
          {(request.status === "pending" || request.status === "needs_information") && (
            <div className="space-y-3 pt-2">
              {form.activeSection === null && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl flex-1"
                    disabled={form.isLoading}
                    onClick={() => form.setActiveSection("approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl flex-1"
                    disabled={form.isLoading}
                    onClick={() => form.setActiveSection("review")}
                  >
                    Reject / Needs Info
                  </Button>
                </div>
              )}

              {form.activeSection === "approve" && (
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
                      value={form.selectedInstructorId}
                      onChange={form.setSelectedInstructorId}
                    />
                  </div>

                  <MeetingPlatformPicker
                    value={form.meetingPlatform}
                    onChange={form.setMeetingPlatform}
                  />

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Meeting Link <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="https://meet.google.com/…"
                      value={form.meetingLink}
                      onChange={(e) => form.setMeetingLink(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Admin Notes (optional)</Label>
                    <Input
                      placeholder="Internal notes…"
                      value={form.adminNotes}
                      onChange={(e) => form.setAdminNotes(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full rounded-xl"
                    disabled={
                      form.isLoading ||
                      !form.selectedInstructorId ||
                      !form.meetingLink.trim()
                    }
                    onClick={form.handleApproveWithSchedule}
                  >
                    {form.isPendingApprove ? "Approving…" : "Approve & Schedule Meeting"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full rounded-xl text-muted-foreground"
                    onClick={() => {
                      form.setActiveSection(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {form.activeSection === "review" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Rejection Reason</Label>
                    <Input
                      placeholder="Required if rejecting…"
                      value={form.rejectionReason}
                      onChange={(e) => form.setRejectionReason(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full rounded-xl"
                      disabled={form.isLoading || !form.rejectionReason.trim()}
                      onClick={() => form.handleStatusUpdate("rejected")}
                    >
                      {form.isPendingStatus ? "Rejecting…" : "Reject Request"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Request More Information</Label>
                    <Input
                      placeholder="What information do you need?"
                      value={form.needsInfoMessage}
                      onChange={(e) => form.setNeedsInfoMessage(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl"
                      disabled={form.isLoading || !form.needsInfoMessage.trim()}
                      onClick={() => form.handleStatusUpdate("needs_information")}
                    >
                      {form.isPendingStatus ? "Sending…" : "Request Info"}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full rounded-xl text-muted-foreground"
                    onClick={() => form.setActiveSection(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Approved → assign instructor */}
          {request.status === "approved" && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold">Assign Instructor</Label>
              <InstructorCombobox
                instructors={approvedInstructors}
                value={form.selectedInstructorId}
                onChange={form.setSelectedInstructorId}
              />
              <Button
                size="sm"
                className="w-full rounded-xl"
                disabled={form.isLoading || !form.selectedInstructorId}
                onClick={form.handleAssign}
              >
                {form.isPendingAssign ? "Assigning…" : "Assign Instructor"}
              </Button>
            </div>
          )}

          {/* Instructor assigned → schedule meeting */}
          {request.status === "instructor_assigned" && (
            <div className="space-y-3 pt-2">
              <MeetingPlatformPicker
                value={form.meetingPlatform}
                onChange={form.setMeetingPlatform}
              />
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Meeting Link</Label>
                <Input
                  placeholder="https://meet.google.com/…"
                  value={form.meetingLink}
                  onChange={(e) => form.setMeetingLink(e.target.value)}
                  className="rounded-xl text-sm"
                />
              </div>
              <Button
                size="sm"
                className="w-full rounded-xl"
                disabled={form.isLoading || !form.meetingLink.trim()}
                onClick={form.handleScheduleMeeting}
              >
                {form.isPendingMeeting ? "Scheduling…" : "Schedule Meeting"}
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
                disabled={form.isLoading}
                onClick={form.handleComplete}
              >
                {form.isPendingComplete ? "Marking…" : "Mark as Completed"}
              </Button>
            </div>
          )}

          <div className="pt-1">
            <Button
              variant="ghost"
              className="w-full rounded-xl text-muted-foreground"
              onClick={form.close}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MeetingPlatformPicker({
  value,
  onChange,
}: {
  value: MeetingPlatform;
  onChange: (v: MeetingPlatform) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold">
        Meeting Platform <span className="text-destructive">*</span>
      </Label>
      <div className="flex gap-2">
        {PLATFORM_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
              value === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="text-muted-foreground font-medium shrink-0 text-xs">{label}</dt>
      <dd className="font-semibold text-foreground text-right text-xs">{value}</dd>
    </div>
  );
}
