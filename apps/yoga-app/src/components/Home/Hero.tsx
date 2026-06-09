"use client"
import { Button } from "@/components/ui/button"
import { Play, Heart, Sparkles } from "lucide-react"
import { StarDoodle, CircleDoodle, WaveDoodle, PlusDoodle } from "@/components/shared/doodles"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-10 md:py-20">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[700px] bg-primary/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0 size-[450px] bg-accent/5 blur-[110px] rounded-full" />
        <div className="absolute top-1/2 left-0 size-[300px] bg-primary/4 blur-[90px] rounded-full" />
      </div>

      {/* Floating doodle decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <StarDoodle className="absolute top-14 right-[13%] size-9 text-primary/25 animate-doodle-float" />
        <CircleDoodle className="absolute -top-12 left-[5%] size-40 text-primary/8 animate-doodle-spin-slow" />
        <StarDoodle className="absolute bottom-20 left-[9%] size-4 text-accent/40 animate-doodle-float-alt" style={{ animationDelay: '1.3s' }} />
        <WaveDoodle className="absolute top-[35%] right-[3%] w-22 text-primary/12 animate-doodle-float" style={{ animationDelay: '2.1s' }} />
        <PlusDoodle className="absolute top-[22%] left-[20%] size-5 text-primary/20 animate-doodle-float-alt" style={{ animationDelay: '0.7s' }} />
        <StarDoodle className="absolute top-[30%] left-[23%] size-2.5 text-accent/45 animate-doodle-float" style={{ animationDelay: '1.8s' }} />
        <CircleDoodle className="absolute -bottom-10 right-[7%] size-56 text-accent/6 animate-doodle-spin-rev" />
        <StarDoodle className="absolute top-[60%] right-[18%] size-3 text-primary/30 animate-doodle-float-alt" style={{ animationDelay: '0.4s' }} />
        <PlusDoodle className="absolute bottom-[30%] left-[3%] size-6 text-primary/15 animate-doodle-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">

          {/* ── Left: Copy ── */}
          <div className="space-y-8 animate-doodle-fade-up">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 px-4 py-1.5 rounded-full">
              <Sparkles className="size-3 fill-primary text-primary" />
              <span className="text-[10px] font-bold tracking-[0.35em] text-primary uppercase">
                Begin your journey
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.6rem] font-serif tracking-tight leading-[1.08] text-balance">
              Your journey to{" "}
              <span className="doodle-underline font-doodle text-primary italic">
                inner peace
              </span>
              <br />
              <span className="text-foreground/65">starts here.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Book Your Yoga Teacher connects you with world-class instructors
              for personalized sessions — helping you build a consistent practice
              at your own pace, from anywhere.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              {/* Primary CTA with pulsing glow ring */}
              <div className="relative group">
                <div className="doodle-glow-ring" />
                <Button className="relative rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/35 hover:scale-105 transition-all duration-300">
                  Start Free Trial
                </Button>
              </div>

              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5 hover:scale-105 transition-all duration-300 sketch-border-sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Preview
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[
                  { initials: "JA", bg: "bg-primary/20" },
                  { initials: "MC", bg: "bg-accent/30" },
                  { initials: "ER", bg: "bg-primary/30" },
                ].map(({ initials, bg }) => (
                  <div
                    key={initials}
                    className={`size-10 rounded-full ${bg} ring-2 ring-background flex items-center justify-center text-xs font-bold hover:scale-110 hover:z-10 transition-transform duration-200 cursor-default relative`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="relative">
                <p className="text-sm text-muted-foreground">
                  Joined by{" "}
                  <span className="font-bold text-foreground">1k+</span>{" "}
                  mindful souls
                </p>
                <StarDoodle className="absolute -top-3 -right-5 size-3.5 text-primary/50 animate-doodle-float" style={{ animationDelay: '0.9s' }} />
              </div>
            </div>
          </div>

          {/* ── Right: Image ── */}
          <div className="relative animate-doodle-fade-up" style={{ animationDelay: '0.18s' }}>
            {/* Soft glow halo */}
            <div className="absolute inset-6 bg-primary/8 rounded-3xl blur-3xl pointer-events-none" />

            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 group hover:-translate-y-1.5 transition-transform duration-500">
              <img
                src="/images/meditation-window.jpg"
                alt="Person meditating by a sunlit window"
                width={600}
                height={500}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
            </div>

            {/* Daily Mood floating card */}
            <div className="absolute -bottom-6 -left-6 md:left-auto md:-right-6 bg-card/96 backdrop-blur-md rounded-2xl shadow-2xl p-4 w-64 border border-border/50 hover:-translate-y-1 transition-transform duration-300 sketch-border-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Daily Mood</span>
                <Heart className="h-4 w-4 text-primary fill-primary animate-pulse" />
              </div>
              <div className="flex gap-1 items-end h-14 mb-2">
                {[38, 52, 68, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary rounded-t-sm transition-all duration-700"
                    style={{ height: `${h}%`, opacity: 0.22 + i * 0.22 }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Inner peace increased by{" "}
                <span className="text-primary font-bold">14%</span> today
              </p>
            </div>

            {/* "Live classes daily" floating badge */}
            <div className="absolute -top-4 -left-4 bg-accent text-accent-foreground rounded-full px-4 py-2 text-[11px] font-bold shadow-lg shadow-accent/25 animate-doodle-float sketch-border-sm flex items-center gap-2">
              <StarDoodle className="size-3 fill-current shrink-0" />
              Live classes daily
            </div>

            {/* Top-right decorative element */}
            <div className="absolute top-4 right-4 size-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 animate-doodle-float-alt" style={{ animationDelay: '1s' }}>
              <Sparkles className="size-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
