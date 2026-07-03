import { ExternalLink } from "lucide-react";
import type { InstructorDemoSession } from "@yoga-app/shared";
import { Badge } from "@/components/ui/badge";

interface DemoSessionCardProps {
  demo: InstructorDemoSession;
}

export function DemoSessionCard({ demo }: DemoSessionCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-5 py-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-sm">{demo.userName}</p>
          <p className="text-xs text-muted-foreground">{demo.userEmail}</p>
        </div>
        <Badge className="text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 shrink-0 bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
          {demo.status === "instructor_assigned" ? "Awaiting Link" : demo.status === "meeting_scheduled" ? "Scheduled" : "Completed"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground font-medium">Phone</p>
          <p className="font-semibold">{demo.phone}</p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium">Date & Time</p>
          <p className="font-semibold">{demo.preferredDate} {demo.preferredTime}</p>
          <p className="text-muted-foreground">{demo.timezone}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
          Goals
        </p>
        <div className="flex flex-wrap gap-1.5">
          {demo.purposes.map((p) => (
            <span
              key={p}
              className="inline-block rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {demo.meetingLink && (
        <a
          href={demo.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="size-3.5" />
          Join Demo Session
        </a>
      )}
    </div>
  );
}
