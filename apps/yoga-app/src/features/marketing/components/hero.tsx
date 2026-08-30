"use client"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Check, Heart, Play, Sparkles } from "lucide-react"
import { StarDoodle, CircleDoodle, WaveDoodle, PlusDoodle } from "@/shared/components/misc/doodles"

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-8 md:pb-12">
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
        <div className="grid items-center gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">

          {/* ── Left: Copy ── */}
          <div className="space-y-7 animate-doodle-fade-up">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5 shadow-sm shadow-primary/5">
              <Sparkles className="size-3 fill-primary text-primary" />
              <span className="text-[10px] font-bold tracking-[0.35em] text-primary uppercase">
                Your practice, your rhythm
              </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-xl text-5xl font-serif font-black leading-[1.02] tracking-tight text-balance md:text-6xl lg:text-[4.35rem]">
              India's Best Yogis.{" "}
              <span className="doodle-underline font-doodle italic text-primary">Now In Your</span>{" "}
              <span className="text-foreground/65">Living Room.</span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Find a teacher who meets you where you are. Build a practice that feels good,
              with live guidance from the comfort of home.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-foreground/70">
              {['Personal guidance', 'Flexible timings', 'All levels welcome'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                    <Check className="size-2.5 text-emerald-700" strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              {/* Primary CTA with pulsing glow ring */}
              <div className="relative group">
                <div className="doodle-glow-ring" />
                <Button asChild className="relative rounded-full bg-primary px-7 py-6 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-primary/35">
                  <Link to="/experts">Find your teacher <ArrowUpRight className="ml-2 size-4" /></Link>
                </Button>
              </div>

              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5 hover:scale-105 transition-all duration-300 sketch-border-sm"
                onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Play className="mr-2 size-3.5 fill-current" />
                Hear from our community
              </Button>
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {['AU', 'PY', 'NC', 'SM'].map((initials, index) => (
                  <span key={initials} className={`flex size-7 items-center justify-center rounded-full border-2 border-background text-[9px] font-bold text-white ${['bg-foreground', 'bg-primary', 'bg-emerald-700', 'bg-amber-700'][index]}`}>
                    {initials}
                  </span>
                ))}
              </div>
              <span><strong className="text-foreground">A growing circle</strong> of mindful practitioners</span>
            </div>

          </div>

          {/* ── Right: Image ── */}
          <div className="relative mx-auto w-full max-w-[560px] animate-doodle-fade-up lg:justify-self-end" style={{ animationDelay: '0.18s' }}>
            {/* Soft glow halo */}
            <div className="absolute inset-6 bg-primary/8 rounded-3xl blur-3xl pointer-events-none" />

            {/* Main image */}
            <div className="relative aspect-[1.05] overflow-hidden rounded-[2rem_0.75rem_2rem_0.75rem] bg-secondary shadow-2xl ring-1 ring-border/50 transition-transform duration-500 group hover:-translate-y-1.5">
              <img
                src="/images/meditation-window.jpg"
                alt="Person meditating by a sunlit window"
                width={600}
                height={500}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-md">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" />
                A moment for yourself
              </div>
            </div>

            {/* Daily Mood floating card */}
            <div className="absolute -bottom-7 -left-3 w-60 rounded-2xl border border-border/50 bg-card/96 p-4 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:-left-8 md:w-64 sketch-border-sm">
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
            <div className="absolute -top-5 right-4 flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[11px] font-bold text-accent-foreground shadow-lg shadow-accent/25 animate-doodle-float sketch-border-sm sm:-right-5">
              <StarDoodle className="size-3 fill-current shrink-0" />
              Live classes daily
            </div>

            {/* Top-right decorative element */}
            <div className="absolute top-4 right-4 size-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 animate-doodle-float-alt" style={{ animationDelay: '1s' }}>
              <Sparkles className="size-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="mt-20 grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-3 sm:gap-0">
          {[
            ['01', 'Meet your match', 'Teachers who understand your goals.'],
            ['02', 'Show up as you are', 'Sessions shaped around your pace.'],
            ['03', 'Keep the feeling', 'Small steps that stay with you.'],
          ].map(([number, title, description], index) => (
            <div key={number} className={`flex gap-3 px-0 py-2 sm:px-5 ${index > 0 ? 'sm:border-l sm:border-border/60' : ''}`}>
              <span className="font-doodle text-lg text-primary">{number}</span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
