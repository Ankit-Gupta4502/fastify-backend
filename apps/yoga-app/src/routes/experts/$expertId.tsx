import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MessageSquare, Radio, Clock, WifiOff, Sparkles, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInstructors } from "@/hooks/use-instructors";
import { Skeleton } from "@/components/ui/skeleton";
import type { InstructorListItem } from "@yoga-app/shared";

export const Route = createFileRoute("/experts/$expertId")({
  component: ExpertDetailPage,
});

const statusConfig = {
  available: { icon: Radio, label: "Available", className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  busy: { icon: Clock, label: "In Session", className: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  offline: { icon: WifiOff, label: "Offline", className: "text-muted-foreground bg-muted/50 border-border/30" },
};

const accentColors = [
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
];

function ExpertDetailPage() {
  const { expertId } = Route.useParams();
  const { data, isLoading } = useInstructors();
  const instructors = data?.data ?? [];
  const instructor = instructors.find((i) => i.id === expertId);

  if (isLoading) return <DetailSkeleton />;
  if (!instructor) return <NotFound />;

  return <InstructorDetail instructor={instructor} />;
}

function InstructorDetail({ instructor }: { instructor: InstructorListItem }) {
  const status = statusConfig[instructor.status];
  const StatusIcon = status.icon;
  const initials = instructor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarGradient = accentColors[Math.abs(instructor.id.charCodeAt(0) + instructor.id.charCodeAt(1)) % accentColors.length];

  return (
    <div className="py-10 space-y-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground gap-2">
        <Link to="/experts">
          <ArrowLeft className="size-4" />
          Back to Experts
        </Link>
      </Button>

      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        {/* Left column */}
        <div className="space-y-6">
          {/* Avatar card */}
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-8 flex flex-col items-center gap-5 shadow-xl">
            <div className="absolute inset-0 opacity-5">
              <div className={cn("w-full h-full bg-linear-to-br", avatarGradient)} />
            </div>
            <div className={cn(
              "relative size-28 rounded-3xl bg-linear-to-br flex items-center justify-center text-white text-4xl font-bold shadow-2xl",
              avatarGradient
            )}>
              {initials}
            </div>
            <div className="relative text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{instructor.name}</h2>
              <p className="text-sm font-bold text-primary/70 uppercase tracking-widest">
                {instructor.specialty[0] ?? "Yoga Instructor"}
              </p>
            </div>
            <div className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold",
              status.className
            )}>
              <StatusIcon className="size-3.5" />
              {status.label}
            </div>
          </div>

          {/* Specialties */}
          {instructor.specialty.length > 0 && (
            <div className="rounded-3xl border border-border/50 bg-card/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-primary/60" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Specialties</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {instructor.specialty.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/15">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Live status */}
          <div className={cn(
            "rounded-3xl border p-5 space-y-2",
            instructor.currentRoomId
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border/50 bg-card/60"
          )}>
            <div className="flex items-center gap-2">
              {instructor.currentRoomId ? (
                <>
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Currently live</span>
                </>
              ) : (
                <>
                  <Users className="size-4 text-primary/60" />
                  <span className="text-sm font-bold text-muted-foreground">Open to new bookings</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {instructor.currentRoomId
                ? "This instructor is currently hosting a live session."
                : "Book a private or group session with this instructor."}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full rounded-2xl h-12 gap-2 font-bold shadow-lg shadow-primary/20">
              <Calendar className="size-4" />
              Book a Session
            </Button>
            <Button variant="outline" className="w-full rounded-2xl h-12 gap-2 font-bold">
              <MessageSquare className="size-4" />
              Send Message
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Hero name */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary/50" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Expert Instructor</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-none">
              {instructor.name}
            </h1>
            <p className="text-xl text-primary/70 font-medium">
              {instructor.specialty.join(" · ") || "Yoga Instructor"}
            </p>
          </div>

          {/* Teaching style placeholders */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold">Teaching Approach</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Mindful & Rhythmic", desc: "Every session flows with intention and breath." },
                { label: "All Levels Welcome", desc: "From first-timers to advanced practitioners." },
                { label: "Alignment Focused", desc: "Strong emphasis on posture and body awareness." },
                { label: "Holistic Practice", desc: "Mind, body, and spirit in harmony." },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm space-y-1.5 hover:border-primary/20 transition-colors">
                  <h4 className="font-bold text-sm">{item.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties detail */}
          {instructor.specialty.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold">Areas of Expertise</h3>
              <div className="space-y-3">
                {instructor.specialty.map((s, i) => (
                  <div key={s} className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/50 hover:border-primary/20 transition-colors">
                    <div className={cn(
                      "size-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 bg-linear-to-br",
                      accentColors[i % accentColors.length]
                    )}>
                      {s.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s}</p>
                      <p className="text-xs text-muted-foreground">Certified specialty</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA banner */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 space-y-4">
            <div className="absolute -right-8 -top-8 size-32 bg-primary/10 blur-2xl rounded-full" />
            <div className="relative space-y-2">
              <h3 className="text-2xl font-serif font-bold">Ready to begin?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Book your first session with {instructor.name.split(" ")[0]} and start your journey today.
              </p>
            </div>
            <Button className="relative rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 px-6">
              <Calendar className="size-4" />
              Book now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="py-10 space-y-10">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-20 text-center space-y-4">
      <p className="text-4xl font-serif font-bold text-muted-foreground/30">404</p>
      <h2 className="text-2xl font-bold">Instructor not found</h2>
      <p className="text-muted-foreground">This instructor may no longer be active.</p>
      <Button asChild variant="outline" className="rounded-full mt-4">
        <Link to="/experts">Browse all experts</Link>
      </Button>
    </div>
  );
}
