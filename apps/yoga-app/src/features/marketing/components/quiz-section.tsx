import { Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useIntersection } from "@/shared/hooks/use-intersection";
import { useQuiz } from "@/features/marketing/hooks/use-quiz";
import { GOALS, FREQUENCIES, NEEDS } from "@/features/marketing/constants/quiz-data";

// ── Step indicators ───────────────────────────────────────────────────────────

function StepDots({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i + 1 < step  ? "size-2 bg-primary"         // completed
            : i + 1 === step ? "w-5 h-2 bg-primary"     // current — wider pill
            : "size-2 bg-border",                        // upcoming
          )}
        />
      ))}
    </div>
  );
}

// ── Goal tile (big emoji card) ────────────────────────────────────────────────

function GoalTile({
  emoji, label, color, selected, onClick,
}: {
  emoji: string; label: string; color: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-sel={selected || undefined}
      className={cn(
        "relative flex flex-col items-center gap-2.5 rounded-2xl border px-3 py-4",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        color,
      )}
    >
      {selected && (
        <span className="absolute top-2 right-2 size-4 rounded-full bg-primary flex items-center justify-center animate-doodle-pop">
          <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
        </span>
      )}
      <span className="text-3xl leading-none select-none">{emoji}</span>
      <span className="text-[11px] font-bold text-center leading-tight">{label}</span>
    </button>
  );
}

// ── Horizontal option row ─────────────────────────────────────────────────────

function OptionRow({
  emoji, label, sub, selected, onClick,
}: {
  emoji: string; label: string; sub: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 w-full rounded-2xl border px-5 py-4",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary/50 bg-primary/8 shadow-md shadow-primary/10"
          : "border-border/50 bg-card/50 hover:border-primary/25 hover:bg-primary/4",
      )}
    >
      {/* Emoji bubble */}
      <span className={cn(
        "size-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200",
        selected ? "bg-primary/15 group-hover:scale-110" : "bg-muted group-hover:scale-110",
      )}>
        {emoji}
      </span>

      <span className="flex-1 text-left">
        <span className="block text-sm font-bold leading-tight">{label}</span>
        <span className="block text-[11px] text-muted-foreground mt-0.5">{sub}</span>
      </span>

      {selected && (
        <span className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0 animate-doodle-pop">
          <Check className="size-3 text-primary-foreground" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ── Floating emoji decoration (intro only) ────────────────────────────────────

function FloatingEmoji({ emoji, className }: { emoji: string; className: string }) {
  return (
    <span
      className={cn(
        "absolute text-2xl select-none pointer-events-none opacity-70",
        className,
      )}
    >
      {emoji}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuizSection() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>();
  const {
    state,
    isPending,
    recommendation,
    isDone,
    handleGoal,
    handleFrequency,
    handleNeed,
    handleReset,
    handleStart,
  } = useQuiz();

  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-20 relative overflow-hidden transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
    >
      {/* Gradient wash */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 px-4 py-1.5 rounded-full">
              <span className="text-sm">🎯</span>
              <span className="text-[10px] font-bold tracking-[0.35em] text-primary uppercase">
                Find your practice
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Which plan is{" "}
              <span className="font-doodle italic text-primary doodle-underline">right for you?</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              3 questions · 30 seconds · personalised recommendation
            </p>
          </div>

          {/* ── Card shell ── */}
          <div className={cn(
            "relative overflow-hidden rounded-3xl border shadow-2xl shadow-primary/8 sketch-border-lg",
            "bg-linear-to-br from-card via-card to-primary/4",
            "border-primary/15",
          )}>
            {/* Decorative corner dots */}
            <span className="absolute top-4 left-4 size-1.5 rounded-full bg-primary/25 pointer-events-none" />
            <span className="absolute top-4 left-7 size-1.5 rounded-full bg-primary/15 pointer-events-none" />
            <span className="absolute top-4 left-10 size-1.5 rounded-full bg-border/60 pointer-events-none" />

            {/* Ambient blob inside card */}
            <div className="absolute bottom-0 right-0 size-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

            {/* Progress dots (shown during questions) */}
            {state.step > 0 && !isDone && (
              <div className="relative flex items-center justify-between px-7 pt-6 pb-0">
                <StepDots step={state.step} />
                <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                  {state.step} / 3
                </span>
              </div>
            )}

            {/* Content */}
            <div className={cn(
              "relative p-7 md:p-9 space-y-6",
              isPending && "opacity-50 pointer-events-none transition-opacity duration-150",
            )}>

              {/* ── Intro ── */}
              {state.step === 0 && (
                <div className="text-center space-y-6 py-2">
                  {/* Floating emoji cluster */}
                  <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    {/* Center big emoji */}
                    <span className="relative z-10 text-6xl select-none animate-doodle-float leading-none">
                      🧘
                    </span>
                    {/* Orbiting small emojis */}
                    <FloatingEmoji emoji="✨" className="top-0 right-2 animate-doodle-float-alt text-lg"  />
                    <FloatingEmoji emoji="🌿" className="bottom-0 left-0 animate-doodle-float text-base" />
                    <FloatingEmoji emoji="💫" className="top-2 left-0 animate-doodle-float-alt text-sm" />
                    <FloatingEmoji emoji="🌸" className="bottom-2 right-0 animate-doodle-float text-base" />
                    {/* Dashed ring */}
                    <span className="absolute inset-0 rounded-full border-2 border-dashed border-primary/15 animate-doodle-spin-slow pointer-events-none" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Find your perfect practice</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Answer 3 quick questions and we'll recommend the plan that fits your life and goals.
                    </p>
                  </div>

                  <div className="relative group mx-auto w-fit">
                    <div className="doodle-glow-ring" />
                    <Button
                      onClick={handleStart}
                      className="relative rounded-full px-10 gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-105 transition-all duration-300"
                    >
                      Let's begin <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 1: Goal ── */}
              {state.step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold">What brings you to yoga?</h3>
                    <p className="text-xs text-muted-foreground">Pick the one that resonates most</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {GOALS.map(({ value, label, emoji, color }) => (
                      <GoalTile
                        key={value}
                        emoji={emoji}
                        label={label}
                        color={color}
                        selected={state.answers.goal === value}
                        onClick={() => handleGoal(value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 2: Frequency ── */}
              {state.step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold">How often can you commit?</h3>
                    <p className="text-xs text-muted-foreground">Be honest — consistency beats intensity</p>
                  </div>
                  <div className="space-y-3">
                    {FREQUENCIES.map(({ value, label, sub, emoji }) => (
                      <OptionRow
                        key={value}
                        emoji={emoji}
                        label={label}
                        sub={sub}
                        selected={state.answers.frequency === value}
                        onClick={() => handleFrequency(value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 3: Needs ── */}
              {state.step === 3 && !isDone && (
                <div className="space-y-5">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold">Any specific needs?</h3>
                    <p className="text-xs text-muted-foreground">Helps us tailor the recommendation</p>
                  </div>
                  <div className="space-y-3">
                    {NEEDS.map(({ value, label, sub, emoji }) => (
                      <OptionRow
                        key={value}
                        emoji={emoji}
                        label={label}
                        sub={sub}
                        selected={state.answers.need === value}
                        onClick={() => handleNeed(value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Result ── */}
              {isDone && recommendation && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
                      Your recommendation
                    </p>
                    <h3 className="text-xl font-bold">We think you'll love this ✨</h3>
                  </div>

                  {/* Result card */}
                  <div className={cn(
                    "relative rounded-2xl overflow-hidden p-6 bg-linear-to-br border border-primary/15 sketch-border-sm",
                    recommendation.gradient,
                  )}>
                    <div className="flex items-start gap-4">
                      <span className="text-4xl leading-none select-none animate-doodle-pop">
                        {recommendation.emoji}
                      </span>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h4 className="text-xl font-doodle font-bold text-primary">
                          {recommendation.title}
                        </h4>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          {recommendation.tagline}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80 pt-1">
                          {recommendation.why}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                      <div className="doodle-glow-ring" />
                      <Button
                        asChild
                        className="relative w-full rounded-full gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-300"
                      >
                        <Link to={recommendation.href}>
                          See this plan <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="rounded-full gap-2 text-muted-foreground hover:text-foreground sketch-border-sm"
                    >
                      <RotateCcw className="size-3.5" />
                      Start over
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
