import { ArrowRight, BarChart3, Users, BookOpen, Music, Heart } from "lucide-react"

export function Features() {
  return (
    <section className="py-12 bg-background/50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
            The Experience
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground leading-[1.15]">
            Designed for your <span className="italic">holistic</span> well-being
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed pt-2">
            Every feature in Solara is crafted to bring more clarity, balance, and intentionality to your daily mindfulness journey.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
          {/* Wellness Tracking - Large 2x2 */}
          <div className="md:col-span-2 md:row-span-2 bg-card rounded-2xl p-10 md:p-14 shadow-sm border border-border/60 flex flex-col justify-between overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <BarChart3 className="size-64 -rotate-12" />
             </div>
             
             <div className="relative z-10 space-y-10 max-w-lg">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                  <BarChart3 className="size-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold tracking-tight text-foreground">Intelligent Wellness Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Monitor your mental landscape with intuitive daily mood journals, sleep quality metrics, and stress-level analytics that help you identify patterns in your peace.
                  </p>
                </div>
             </div>
             
             <div className="relative z-10 flex gap-3 items-end h-24 mt-12">
                {[45, 60, 75, 55, 85, 100, 70, 90].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/10 rounded-t-lg transition-all duration-700 hover:bg-primary group-hover:bg-primary/30" 
                    style={{ height: `${h}%` }}
                  />
                ))}
             </div>
          </div>

          {/* Sanctuary Community - 1x1 */}
          <div className="bg-accent rounded-2xl p-8 text-accent-foreground shadow-sm flex flex-col group border border-accent/20">
            <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110 mb-auto shadow-sm">
              <Users className="size-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Sanctuary Community</h3>
              <p className="text-accent-foreground/80 text-sm leading-relaxed">
                Belong in private circles of mindful individuals who share your journey.
              </p>
            </div>
          </div>

          {/* Expert Guides - 1x1 */}
          <div className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-sm flex flex-col group border border-primary/20">
            <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110 mb-auto shadow-sm">
              <BookOpen className="size-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Expert Guides</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                World-renowned mindfulness masters at your fingertips.
              </p>
            </div>
          </div>

          {/* Sonic Sanctuaries - 1x1 */}
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border/60 flex flex-col group">
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground mb-auto shadow-sm">
              <Music className="size-5.5" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground">Sonic Sanctuaries</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Immersive 3D soundscapes and high-fidelity meditations.
                </p>
              </div>
              <a href="#" className="inline-flex items-center text-primary text-[10px] font-bold hover:gap-2.5 transition-all gap-2 uppercase tracking-[0.2em] pt-1">
                Explore <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          {/* Hands Image - 1x1 */}
          <div className="rounded-2xl overflow-hidden shadow-sm relative group border border-border/40">
            <img
              src="/images/hands-meditation.jpg"
              alt="Peaceful meditation hands"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-700" />
          </div>

          {/* Daily Rituals - 1x1 */}
          <div className="bg-secondary/20 rounded-2xl p-8 shadow-sm border border-border/40 flex flex-col group">
            <div className="h-11 w-11 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground transition-transform group-hover:rotate-12 mb-auto shadow-sm">
              <Heart className="size-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground">Daily Rituals</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Micro-practices that fit seamlessly into your existing daily life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
