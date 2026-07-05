import { UserPlus, CreditCard, CalendarCheck, Leaf } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up in seconds — no credit card required. Your 1st Workshop is Free.",
    accent: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    line: "from-sky-500/20 to-primary/20",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Choose your plan",
    description: "Pick Private for dedicated 1:1 time with Our Best instructor, or choose Prenatal or Therapeutic yoga for specialised care.",
    accent: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    line: "from-primary/20 to-emerald-500/20",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Book a session",
    description: "Browse live sessions across your time zone. Reserve your spot in one tap — the room opens automatically.",
    accent: "bg-primary/10 text-primary border-primary/20",
    line: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    number: "04",
    icon: Leaf,
    title: "Practice & grow",
    description: "Show up, breathe, and move. Track your weekly sessions and watch your practice deepen over time.",
    accent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    line: null,
  },
];

export function Process() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-16 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-primary/30" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-[1.15]">
            From signup to{" "}
            <span className="italic text-primary">first breath</span>
            <br />in four steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col group">
                {/* Connector line (desktop) */}
                {step.line && (
                  <div className={cn(
                    "hidden lg:block absolute top-9 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-linear-to-r",
                    step.line
                  )} />
                )}

                <div className="flex flex-col gap-5 p-6 rounded-3xl border border-transparent hover:border-border/50 hover:bg-card/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
                  {/* Icon + number */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "relative size-[4.5rem] rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                      step.accent
                    )}>
                      <Icon className="size-6" />
                      <span className="absolute -top-2 -right-2 size-5 rounded-full bg-background border border-border/60 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-5xl font-serif font-bold text-border/30 group-hover:text-border/50 transition-colors select-none">
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg tracking-tight">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Connector line (mobile/tablet) */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden mx-6 my-1 h-6 w-px bg-linear-to-b from-border/40 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
