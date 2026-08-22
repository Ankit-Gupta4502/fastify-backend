import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell } from "@/components/ui/table";
import { ErrorCard } from "@/shared/components/misc/error-card";
import { Chip } from "@/shared/components/misc/chip";
import { SectionCard } from "@/shared/components/misc/section-card";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { useAdminInstructorSessionDetail } from "@/features/admin/hooks/use-admin";

export const Route = createFileRoute("/admin/instructors/$instructorId/sessions/$roomId")({
  component: AdminInstructorSessionDetailPage,
});

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PARTICIPANT_COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "joinedAt", header: "Joined at" },
  { key: "leftAt", header: "Left at" },
  { key: "status", header: "Status" },
];

function AdminInstructorSessionDetailPage() {
  const { instructorId, roomId } = Route.useParams();
  const { data, isLoading, error } = useAdminInstructorSessionDetail(instructorId, roomId);
  const detail = data?.data;

  if (error) return <ErrorCard message="Failed to load session details." />;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/instructors/$instructorId"
        params={{ instructorId }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to instructor
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-7 w-64" />
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ) : detail ? (
        <>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight capitalize">{detail.room.type} session</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {formatDateTime(detail.room.scheduledStart)} – {formatDateTime(detail.room.scheduledEnd)}
              </span>
              <Chip variant={detail.room.status === "ended" ? "muted" : "info"}>{detail.room.status}</Chip>
            </div>
            {detail.room.meetLink && (
              <a
                href={detail.room.meetLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Google Meet link
              </a>
            )}
          </div>

          <SectionCard title="Instructor attendance">
            {detail.instructor ? (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Joined at</p>
                  <p className="font-medium">{formatDateTime(detail.instructor.joinedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Left at</p>
                  <p className="font-medium">
                    {detail.instructor.leftAt ? formatDateTime(detail.instructor.leftAt) : "Still in session"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not tracked for this session{detail.room.meetLink ? " (external Google Meet link)" : ""}.
              </p>
            )}
          </SectionCard>

          <SectionCard title={`Participants (${detail.participants.length})`}>
            <DataTable
              columns={PARTICIPANT_COLUMNS}
              data={detail.participants}
              getRowKey={(p) => p.userId}
              emptyMessage="No participants joined this session."
              renderCells={(p) => (
                <>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(p.joinedAt)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.leftAt ? formatDateTime(p.leftAt) : "Still in session"}
                  </TableCell>
                  <TableCell>
                    <Chip variant={p.status === "completed" ? "success" : p.status === "dropped" ? "muted" : "info"}>
                      {p.status}
                    </Chip>
                  </TableCell>
                </>
              )}
            />
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
