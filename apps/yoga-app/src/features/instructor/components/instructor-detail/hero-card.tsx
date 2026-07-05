import { Calendar, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { InstructorAvatar } from "@/shared/components/misc/instructor-avatar";
import { useInstructorDetail } from "./context";
import { useMyPlan } from "@/features/payments/hooks/use-plans";
import { useNavigate } from "@tanstack/react-router";

export function HeroCard() {
  const { instructor, gradient, status } = useInstructorDetail();
  const StatusIcon = status.icon;
  const { data: myPlan } = useMyPlan();
  const navigate = useNavigate();

  function handleBook() {
    if (!myPlan?.data?.length) {
      navigate({ to: "/pricing" });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 sketch-border-sm p-8">
<div className={cn("absolute inset-0 bg-linear-to-br opacity-[0.04]", gradient)} />
      <div className="absolute top-0 right-0 size-72 bg-primary/8 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 2400 64"
          className="absolute bottom-0 left-0 w-[200%] h-full animate-hero-wave"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C150,20 450,56 600,40 C750,20 1050,56 1200,40 C1350,20 1650,56 1800,40 C1950,20 2250,56 2400,40 L2400,64 L0,64 Z"
            fill="currentColor"
            className="text-primary/5"
          />
          <path
            d="M0,50 C150,34 450,62 600,50 C750,34 1050,62 1200,50 C1350,34 1650,62 1800,50 C1950,34 2250,62 2400,50 L2400,64 L0,64 Z"
            fill="currentColor"
            className="text-primary/8"
          />
        </svg>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-7 items-start sm:items-center">
        <InstructorAvatar
          src={instructor.profileImageUrl}
          name={instructor.name}
          className="size-28 rounded-3xl shadow-2xl shrink-0"
          fallbackClassName={cn("bg-linear-to-br", gradient)}
          initialsClassName="text-4xl font-bold text-white"
        />

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary/60" style={{ animation: "spin 20s linear infinite" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Expert Instructor</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-none">
            {instructor.name}
          </h1>

          {instructor.tagline ? (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">{instructor.tagline}</p>
          ) : (
            <p className="text-base text-primary/70 font-medium">
              {instructor.specialty.join(" · ") || "Yoga Instructor"}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold", status.className)}>
              <StatusIcon className="size-3" />
              {status.label}
            </div>
            {instructor.yearsOfExperience != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {instructor.yearsOfExperience}+ yrs
              </div>
            )}
            {instructor.currentRoomId && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live now
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-2 shrink-0">
          <Button onClick={handleBook} className="rounded-2xl gap-2 font-bold shadow-md shadow-primary/20 px-6">
            <Calendar className="size-4" />
            Book a Session
          </Button>
        </div>
      </div>
    </div>
  );
}
