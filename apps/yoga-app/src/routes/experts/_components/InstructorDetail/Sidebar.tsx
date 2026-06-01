import { Calendar, MessageSquare, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/shared/chip";
import { useInstructorDetail } from "./context";
import { SideCard, SideCardLabel } from "./primitives";

export function Sidebar() {
  const { instructor } = useInstructorDetail();

  return (
    <div className="space-y-5">
      {instructor.specialty.length > 0 && (
        <SideCard>
          <SideCardLabel icon={Award}>Specialties</SideCardLabel>
          <div className="flex flex-wrap gap-2">
            {instructor.specialty.map((s) => <Chip key={s} size="md">{s}</Chip>)}
          </div>
        </SideCard>
      )}

      {instructor.tags.length > 0 && (
        <SideCard>
          <SideCardLabel>Focus Areas</SideCardLabel>
          <div className="flex flex-wrap gap-2">
            {instructor.tags.map((t) => <Chip key={t} variant="muted" size="md">{t}</Chip>)}
          </div>
        </SideCard>
      )}

      <SideCard className={instructor.currentRoomId ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
        <div className="flex items-center gap-2">
          {instructor.currentRoomId ? (
            <>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Currently live</span>
            </>
          ) : (
            <>
              <Users className="size-4 text-primary/60" />
              <span className="text-sm font-bold">Open to bookings</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {instructor.currentRoomId
            ? "This instructor is hosting a live session right now."
            : "Book a private or group session with this instructor."}
        </p>
      </SideCard>

      {/* Mobile actions */}
      <div className="md:hidden space-y-2.5">
        <Button className="w-full rounded-2xl h-11 gap-2 font-bold shadow-md shadow-primary/20">
          <Calendar className="size-4" />
          Book a Session
        </Button>
        <Button variant="outline" className="w-full rounded-2xl h-11 gap-2 font-bold">
          <MessageSquare className="size-4" />
          Send Message
        </Button>
      </div>
    </div>
  );
}
