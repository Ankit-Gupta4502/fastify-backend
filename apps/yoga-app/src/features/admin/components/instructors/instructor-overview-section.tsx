import { Star } from "lucide-react";
import type { AdminInstructorDetail } from "@yoga-app/shared";
import { Chip } from "@/shared/components/misc/chip";
import { relativeFromNow } from "@/shared/lib/timezone";
import { AVAILABILITY_DAYS } from "@/shared/constants";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground w-32 shrink-0 pt-0.5 font-medium">{label}</span>
      <span className="text-sm text-foreground flex-1 break-all">
        {value ?? <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

export function InstructorOverviewSection({ instructor }: { instructor: AdminInstructorDetail }) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Status</p>
        <Row
          label="Approval"
          value={
            instructor.isApproved ? (
              <Chip variant="success">Approved</Chip>
            ) : (
              <Chip variant="warning">Pending</Chip>
            )
          }
        />
        <Row label="Availability status" value={<span className="capitalize">{instructor.status}</span>} />
        <Row label="Max concurrent sessions" value={instructor.maxConcurrentSessions} />
        <Row
          label="Rating"
          value={
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 text-primary fill-primary" />
              {instructor.rating.toFixed(1)}
            </span>
          }
        />
        <Row label="Students guided" value={instructor.studentsGuided} />
      </section>

      <section>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Specialties</p>
        {instructor.specialty.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {instructor.specialty.map((s) => (
              <Chip key={s} variant="muted">{s}</Chip>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No specialties set.</p>
        )}
      </section>

      <section>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Weekly availability</p>
        {instructor.availability.length > 0 ? (
          <div className="space-y-2">
            <div className="rounded-2xl border border-border/60 divide-y divide-border/40 overflow-hidden">
              {AVAILABILITY_DAYS.map(({ dow, label, short }) => {
                const windows = instructor.availability.filter((window) => window.dow === dow);
                return (
                  <div key={dow} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={
                        windows.length > 0
                          ? "w-14 shrink-0 text-xs font-semibold text-primary"
                          : "w-14 shrink-0 text-xs text-muted-foreground"
                      }
                      title={label}
                    >
                      {short}
                    </span>
                    <span className="text-sm">
                      {windows.length > 0
                        ? windows.map((window) => `${window.start} – ${window.end}`).join(", ")
                        : <span className="text-muted-foreground">Unavailable</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            {instructor.availabilityUpdatedAt && (
              <p className="text-[11px] text-muted-foreground">
                Updated {relativeFromNow(instructor.availabilityUpdatedAt)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No availability set.</p>
        )}
      </section>
    </div>
  );
}
