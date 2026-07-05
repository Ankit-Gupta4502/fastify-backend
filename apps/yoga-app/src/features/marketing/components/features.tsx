import React from "react"
import { ArrowRight, BarChart3, Users, BookOpen, Music, Heart } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useIntersection } from "@/shared/hooks/use-intersection"

// ── Doodle helpers ────────────────────────────────────────────────────────────

import { StarDoodle } from "@/shared/components/misc/doodles"

// ── Mood ring (Wellness Tracking card) ────────────────────────────────────────

function MoodRing({ label, pct, color, isHovered }: { label: string; pct: number; color: string; isHovered?: boolean }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-14 flex items-center justify-center">
        <svg viewBox="0 0 56 56" className="size-full -rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-border/30" />
          <circle
            cx="28" cy="28" r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${isHovered ? dash : 0} ${circ}`}
            className={cn("transition-all duration-700", color)}
            style={{ transitionDelay: isHovered ? "100ms" : "0ms" }}
          />
        </svg>
        <span className="absolute text-[11px] font-bold">{pct}%</span>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  )
}

// ── Equaliser bars (Sonic card) ───────────────────────────────────────────────

function Equaliser({ isHovered }: { isHovered?: boolean }) {
  const bars = [40, 70, 55, 90, 65, 80, 45, 75]
  return (
    <div className="flex items-end gap-1 h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/60 rounded-full transition-all duration-500"
          style={{
            height: isHovered ? `${h}%` : "20%",
            transitionDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ── Mini checklist (Daily Rituals card) ──────────────────────────────────────

const RITUALS = ["Morning breathwork", "Midday walk", "Evening meditation"]

function MiniChecklist({ isHovered }: { isHovered?: boolean }) {
  return (
    <ul className="space-y-1.5">
      {RITUALS.map((item, i) => (
        <li key={item} className="flex items-center gap-2">
          <span className={cn(
            "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
            isHovered && i < 2
              ? "border-primary bg-primary"
              : "border-border/50 bg-transparent",
          )} style={{ transitionDelay: `${i * 80}ms` }}>
            {isHovered && i < 2 && (
              <svg viewBox="0 0 10 10" className="size-2.5 text-white" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className={cn("text-[11px] font-medium transition-colors duration-300", isHovered && i < 2 ? "line-through text-muted-foreground/50" : "text-foreground/70")}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ── Avatar cluster (Community card) ──────────────────────────────────────────

const AVATARS = ["SC", "MR", "AJ", "DP", "ER"]
const AVATAR_COLORS = ["bg-violet-500", "bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-rose-500"]

function AvatarCluster({ isHovered }: { isHovered?: boolean }) {
  return (
    <div className="flex -space-x-2">
      {AVATARS.map((a, i) => (
        <div
          key={a}
          className={cn(
            "size-7 rounded-full border-2 border-white/20 flex items-center justify-center text-[9px] font-bold text-white shrink-0",
            "transition-transform duration-300",
            AVATAR_COLORS[i],
            isHovered && "hover:z-10",
          )}
          style={{ transitionDelay: `${i * 40}ms`, transform: isHovered ? `translateX(${i * -2}px)` : undefined }}
        >
          {a}
        </div>
      ))}
      <div className="size-7 rounded-full border-2 border-white/20 bg-white/20 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
        +8k
      </div>
    </div>
  )
}

// ── Star rating display (Expert Guides card) ─────────────────────────────────

function StarRating({ isHovered }: { isHovered?: boolean }) {
  return (
    <div className="space-y-1">
      {[5, 4, 3].map((n, row) => {
        const pct = row === 0 ? 82 : row === 1 ? 14 : 4
        return (
          <div key={n} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/70 w-3">{n}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-500"
                style={{ width: isHovered ? `${pct}%` : "0%", transitionDelay: `${row * 80}ms` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Features() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>({ threshold: 0.08 })

  // Individual hover states for interactive cells
  const [hoveredCell, setHoveredCell] = React.useState<string | null>(null)
  const hovered = (id: string) => hoveredCell === id
  const hoverProps = (id: string) => ({
    onMouseEnter: () => setHoveredCell(id),
    onMouseLeave: () => setHoveredCell(null),
  })

  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-14 bg-background/50 relative overflow-hidden transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-1/4 right-0 size-80 bg-accent/4 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 size-64 bg-primary/4 blur-[80px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2.5">
            <StarDoodle className="size-3.5 text-primary/40 animate-doodle-float" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md">
              The Experience
            </span>
            <StarDoodle className="size-3.5 text-primary/40 animate-doodle-float-alt" style={{ animationDelay: "0.6s" }} />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-[1.15]">
            Designed for your{" "}
            <span className="font-doodle italic text-primary doodle-underline">holistic</span>{" "}
            well-being
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every feature in Book Your Yoga Teacher is crafted to help you find the perfect instructor and build a sustainable, fulfilling yoga practice.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[220px]">

          {/* ── Wellness Tracking 2×2 ── */}
          <div
            {...hoverProps("wellness")}
            className={cn(
              "md:col-span-2 md:row-span-2 bg-card rounded-3xl border border-border/50 flex flex-col justify-between overflow-hidden relative group cursor-default",
              "hover:border-primary/25 hover:shadow-xl hover:shadow-primary/6 hover:-translate-y-1 transition-all duration-500 sketch-border-lg",
            )}
          >
            {/* Ghost icon */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.025] group-hover:opacity-[0.055] transition-opacity duration-500 pointer-events-none">
              <BarChart3 className="size-56 -rotate-12" />
            </div>
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="p-10 md:p-12 space-y-6 relative z-10">
              <div className={cn(
                "size-14 rounded-2xl bg-primary/10 border border-primary/12 flex items-center justify-center text-primary",
                "group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary/16 transition-all duration-300",
              )}>
                <BarChart3 className="size-7" />
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Intelligent Wellness Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your mental landscape with daily mood journals, sleep metrics, and stress analytics that reveal patterns in your peace.
                </p>
              </div>
            </div>

            {/* Bottom visual: mood rings + bar chart */}
            <div className="px-10 md:px-12 pb-10 relative z-10 space-y-6">
              {/* Mood rings row */}
              <div className="flex items-end gap-6">
                <MoodRing label="Sleep"    pct={78} color="text-sky-400"     isHovered={hovered("wellness")} />
                <MoodRing label="Mood"     pct={91} color="text-primary"     isHovered={hovered("wellness")} />
                <MoodRing label="Stress"   pct={34} color="text-rose-400"    isHovered={hovered("wellness")} />
                <MoodRing label="Energy"   pct={82} color="text-emerald-400" isHovered={hovered("wellness")} />
                {/* Bar chart */}
                <div className="flex-1 flex gap-1.5 items-end h-14">
                  {[45, 62, 78, 55, 88, 100, 72, 93].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/15 rounded-t-md transition-all duration-500 group-hover:bg-primary/30"
                      style={{ height: `${h}%`, transitionDelay: `${i * 35}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sanctuary Community ── */}
          <div
            {...hoverProps("community")}
            className="bg-accent rounded-2xl p-7 text-accent-foreground shadow-sm flex flex-col group border border-accent/20 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-400 overflow-hidden relative cursor-default sketch-border-sm"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center mb-auto shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/30 transition-all duration-300">
              <Users className="size-5" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">Sanctuary Community</h3>
                <p className="text-accent-foreground/75 text-sm leading-relaxed">
                  Private circles of mindful individuals who share your journey.
                </p>
              </div>
              <AvatarCluster isHovered={hovered("community")} />
            </div>
          </div>

          {/* ── Expert Guides ── */}
          <div
            {...hoverProps("experts")}
            className="bg-primary rounded-2xl p-7 text-primary-foreground shadow-sm flex flex-col group border border-primary/20 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-400 overflow-hidden relative cursor-default sketch-border-sm"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center mb-auto shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/30 transition-all duration-300">
              <BookOpen className="size-5" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">Expert Guides</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">
                  World-renowned mindfulness masters at your fingertips.
                </p>
              </div>
              <StarRating isHovered={hovered("experts")} />
            </div>
          </div>

          {/* ── Sonic Sanctuaries ── */}
          <div
            {...hoverProps("sonic")}
            className="bg-card rounded-2xl p-7 shadow-sm border border-border/50 flex flex-col group hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-400 overflow-hidden relative cursor-default sketch-border-sm"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-auto shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Music className="size-5" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">Sonic Sanctuaries</h3>
                <p className="text-muted-foreground text-sm">3D soundscapes & high-fidelity meditations.</p>
              </div>
              <Equaliser isHovered={hovered("sonic")} />
              <a href="#" className="inline-flex items-center text-primary text-[10px] font-bold hover:gap-3 transition-all gap-2 uppercase tracking-[0.2em]">
                Explore <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          {/* ── Meditation image ── */}
          <div className="rounded-2xl overflow-hidden shadow-sm relative group border border-border/40 hover:shadow-xl transition-all duration-400 cursor-default sketch-border-sm">
            <img
              src="/images/hands-meditation.jpg"
              alt="Peaceful meditation hands"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-bold text-sm leading-tight opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                Find your flow
              </p>
              <p className="text-white/70 text-[11px] opacity-0 group-hover:opacity-100 transition-all duration-400 delay-75 translate-y-2 group-hover:translate-y-0">
                Live · On-demand · Anytime
              </p>
            </div>
          </div>

          {/* ── Daily Rituals ── */}
          <div
            {...hoverProps("rituals")}
            className="bg-secondary/20 rounded-2xl p-7 shadow-sm border border-border/40 flex flex-col group hover:shadow-xl hover:border-primary/15 hover:-translate-y-1 transition-all duration-400 overflow-hidden relative cursor-default sketch-border-sm"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-11 w-11 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground mb-auto shadow-sm group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Heart className="size-5" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">Daily Rituals</h3>
                <p className="text-muted-foreground text-sm">Micro-practices that fit seamlessly into your day.</p>
              </div>
              <MiniChecklist isHovered={hovered("rituals")} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
