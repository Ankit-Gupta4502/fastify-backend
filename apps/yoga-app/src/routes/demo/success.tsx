import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMyDemoRequests } from "@/hooks/use-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DemoRequestStatus, MyDemoRequest } from "@yoga-app/shared";
import { ExternalLink } from "lucide-react";

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute("/demo/success")({
  validateSearch: searchSchema,
  component: DemoSuccessPage,
});

const STATUS_META: Record<
  DemoRequestStatus,
  { label: string; color: string; description: string }
> = {
  pending: {
    label: "Pending Review",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    description:
      "Our team is reviewing your request and will match you with a suitable instructor soon.",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    description:
      "Your request has been approved! We are now finding the right instructor for you.",
  },
  rejected: {
    label: "Not Available",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    description:
      "We were unable to accommodate your request at this time. See details below.",
  },
  needs_information: {
    label: "Action Required",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    description:
      "Our team needs a bit more information to proceed. Please update your request.",
  },
  instructor_assigned: {
    label: "Instructor Assigned",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    description:
      "An instructor has been matched to your session. Your meeting link will arrive shortly.",
  },
  meeting_scheduled: {
    label: "Meeting Scheduled",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    description:
      "Your demo session is confirmed! Check below for your meeting link.",
  },
  completed: {
    label: "Completed",
    color: "bg-muted/60 text-muted-foreground border-muted",
    description:
      "You have completed your free demo session. We hope it was wonderful!",
  },
};

function DemoSuccessPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const { data, isLoading } = useMyDemoRequests();

  const requests = data?.data ?? [];
  const request: MyDemoRequest | undefined = id
    ? requests.find((r) => r.id === id)
    : requests[requests.length - 1];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">No demo request found.</p>
        <Button asChild className="rounded-xl">
          <Link to="/demo">Book a Free Class</Link>
        </Button>
      </div>
    );
  }

  const meta = STATUS_META[request.status];
  const isNeedsInfo = request.status === "needs_information";
  const isMeetingScheduled = request.status === "meeting_scheduled";
  const isCompleted = request.status === "completed";
  const isRejected = request.status === "rejected";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Success / status header */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-8 space-y-5 text-center">
          <div className="text-5xl">
            {isMeetingScheduled ? "🎉" : isCompleted ? "🧘" : isRejected ? "😔" : "📋"}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              {isMeetingScheduled
                ? "Your Session Is Confirmed!"
                : isCompleted
                  ? "Session Completed"
                  : isRejected
                    ? "Request Unavailable"
                    : "Request Received!"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {meta.description}
            </p>
          </div>

          <Badge
            className={cn(
              "px-4 py-1.5 text-xs font-bold uppercase tracking-widest border rounded-full",
              meta.color,
            )}
          >
            {meta.label}
          </Badge>
        </div>

        {/* Session details card */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-6 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Your Details
          </p>

          <dl className="space-y-3">
            <Row label="Preferred Date" value={request.preferredDate} />
            <Row label="Preferred Time" value={`${request.preferredTime} (${request.timezone})`} />
            <Row label="Goals" value={request.purposes.join(", ")} />
            {request.otherPurpose && (
              <Row label="Other Goal" value={request.otherPurpose} />
            )}
            {request.assignedInstructor && (
              <Row label="Instructor" value={request.assignedInstructor.name} />
            )}
          </dl>

          {/* Meeting link */}
          {isMeetingScheduled && request.meetingLink && (
            <a
              href={request.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="size-4" />
              Join Session
            </a>
          )}

          {/* Rejection reason */}
          {isRejected && request.rejectionReason && (
            <div className="rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              <strong>Reason:</strong> {request.rejectionReason}
            </div>
          )}

          {/* Needs more info message */}
          {isNeedsInfo && request.needsInfoMessage && (
            <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
              <strong>Message from our team:</strong> {request.needsInfoMessage}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          {isNeedsInfo && (
            <Button
              className="w-full rounded-xl"
              onClick={() => void navigate({ to: "/demo", search: {} })}
            >
              Update My Request
            </Button>
          )}

          {(isCompleted || isRejected) && (
            <Button
              className="w-full rounded-xl"
              onClick={() => void navigate({ to: "/demo", search: {} })}
            >
              Book Another Demo Class
            </Button>
          )}

          {isCompleted && (
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link to="/billing">Upgrade to a Paid Plan</Link>
            </Button>
          )}

          <Button variant="ghost" className="w-full rounded-xl" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="text-muted-foreground font-medium shrink-0">{label}</dt>
      <dd className="font-semibold text-foreground text-right">{value}</dd>
    </div>
  );
}
