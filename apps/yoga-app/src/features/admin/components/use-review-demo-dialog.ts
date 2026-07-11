import { useState } from "react";
import type { AdminDemoRequest, MeetingPlatform } from "@yoga-app/shared";
import {
  useAdminApproveWithSchedule,
  useAdminAssignInstructor,
  useAdminCompleteDemoSession,
  useAdminScheduleDemoMeeting,
  useAdminUpdateDemoStatus,
} from "@/features/demo/hooks/use-demo";

export type ActiveSection = "review" | "approve" | null;

export function useReviewDemoDialog(
  request: AdminDemoRequest | null,
  onClose: () => void,
) {
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
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  const isLoading =
    approveWithSchedule.isPending ||
    updateStatus.isPending ||
    assignInstructor.isPending ||
    scheduleMeeting.isPending ||
    completeSession.isPending;

  const close = () => {
    setError(null);
    setActiveSection(null);
    setRejectionReason("");
    setNeedsInfoMessage("");
    setAdminNotes("");
    setSelectedInstructorId("");
    setMeetingLink("");
    setMeetingPlatform("google_meet");
    onClose();
  };

  const handleApproveWithSchedule = () => {
    if (!request) return;
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
    if (!request) return;
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
    if (!request) return;
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
    if (!request) return;
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
    if (!request) return;
    setError(null);
    completeSession.mutate(request.id, {
      onSuccess: close,
      onError: (err) => setError(err instanceof Error ? err.message : "Action failed"),
    });
  };

  return {
    rejectionReason, setRejectionReason,
    needsInfoMessage, setNeedsInfoMessage,
    adminNotes, setAdminNotes,
    selectedInstructorId, setSelectedInstructorId,
    meetingLink, setMeetingLink,
    meetingPlatform, setMeetingPlatform,
    error,
    activeSection, setActiveSection,
    isLoading,
    isPendingApprove: approveWithSchedule.isPending,
    isPendingStatus: updateStatus.isPending,
    isPendingAssign: assignInstructor.isPending,
    isPendingMeeting: scheduleMeeting.isPending,
    isPendingComplete: completeSession.isPending,
    close,
    handleApproveWithSchedule,
    handleStatusUpdate,
    handleAssign,
    handleScheduleMeeting,
    handleComplete,
  };
}
