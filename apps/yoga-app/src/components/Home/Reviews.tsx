import { Star, Quote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Sarah Chen",
    role: "Yoga Instructor",
    content: "Solara has completely transformed how I manage my studio. The structured workspace and booking system are seamless. It feels like the app actually breathes with my classes.",
    rating: 5,
    initials: "SC",
    accent: "from-violet-500/10 to-purple-500/5",
    avatarColor: "from-violet-500 to-purple-600",
  },
  {
    name: "Michael Ross",
    role: "Wellness Advocate",
    content: "The mindfulness tools integrated directly into my daily workflow have helped me maintain balance during my busiest weeks. Truly a masterpiece of functional design.",
    rating: 5,
    initials: "MR",
    accent: "from-emerald-500/10 to-teal-500/5",
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    name: "Elena Rodriguez",
    role: "Student",
    content: "I love how easy it is to track my progress and book classes. The interface is calm and truly reflects the yoga spirit. It's my daily digital sanctuary.",
    rating: 5,
    initials: "ER",
    accent: "from-rose-500/10 to-pink-500/5",
    avatarColor: "from-rose-500 to-pink-600",
  },
  {
    name: "David Park",
    role: "Studio Owner",
    content: "Finally a platform that understands the specific needs of a yoga community. The shared schemas and data integrity are top-notch. It's the backbone of my business now.",
    rating: 5,
    initials: "DP",
    accent: "from-amber-500/10 to-orange-500/5",
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    name: "Aisha Jallow",
    role: "Mindfulness Coach",
    content: "A beautiful blend of technology and zen. Solara is the perfect companion for anyone on a journey to inner peace. It doesn't just manage data; it manages energy.",
    rating: 5,
    initials: "AJ",
    accent: "from-sky-500/10 to-blue-500/5",
    avatarColor: "from-sky-500 to-blue-600",
  },
  {
    name: "James Wilson",
    role: "Daily Practitioner",
    content: "The best yoga management app I've used. Clean, fast, and reliable. It just works exactly how you want it to, allowing me to focus on my practice instead of my phone.",
    rating: 5,
    initials: "JW",
    accent: "from-indigo-500/10 to-violet-500/5",
    avatarColor: "from-indigo-500 to-violet-600",
  }
];

export function Reviews() {
  return (
    <section className="py-24 relative overflow-hidden bg-background/50">
      <div className="absolute top-0 left-1/4 size-[500px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 size-[500px] bg-accent/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Voices of Peace</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground leading-[1.15]">
              Trusted by the <br />
              <span className="text-primary italic font-medium">Global Sangha</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-base max-w-sm leading-relaxed pb-1.5 border-l-2 border-primary/20 pl-6">
            Real stories from instructors and practitioners who found their center with Solara.
          </p>
        </div>

        {/* Masonry Wall */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={cn(
                "break-inside-avoid relative group p-8 rounded-3xl border border-border/50 bg-gradient-to-br bg-card/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/8 hover:border-primary/25 overflow-hidden",
                review.accent && `bg-gradient-to-br ${review.accent}`
              )}
            >
              {/* Shimmer line on top */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <Quote className="absolute top-5 right-6 size-12 text-foreground/[0.04] group-hover:text-foreground/[0.08] transition-all duration-500 group-hover:scale-110" />

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3.5 transition-all duration-300",
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "opacity-20 text-muted-foreground"
                    )}
                  />
                ))}
              </div>

              <p className="text-base font-serif italic leading-relaxed mb-8 text-foreground/75 group-hover:text-foreground/90 transition-colors duration-300">
                "{review.content}"
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-border/30">
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-2xl bg-secondary text-foreground flex items-center justify-center font-bold text-xs transition-all duration-300 group-hover:scale-105">
                    {review.initials}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                      {review.name}
                      <CheckCircle2 className="size-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Metrics */}
        <div className="mt-24 flex flex-wrap justify-center gap-12 md:gap-28">
          {[
            { value: "12k+", label: "Mindful Souls" },
            { value: "400+", label: "Studios Connected" },
            { value: "98%", label: "Calm Index" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <p className="text-4xl font-serif font-bold italic text-foreground/70 group-hover:text-primary transition-colors duration-300">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
