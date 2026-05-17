import { Star, Quote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Sarah Chen",
    role: "Yoga Instructor",
    content: "Solara has completely transformed how I manage my studio. The structured workspace and booking system are seamless. It feels like the app actually breathes with my classes.",
    rating: 5,
    initials: "SC",
  },
  {
    name: "Michael Ross",
    role: "Wellness Advocate",
    content: "The mindfulness tools integrated directly into my daily workflow have helped me maintain balance during my busiest weeks. Truly a masterpiece of functional design.",
    rating: 5,
    initials: "MR",
  },
  {
    name: "Elena Rodriguez",
    role: "Student",
    content: "I love how easy it is to track my progress and book classes. The interface is calm and truly reflects the yoga spirit. It's my daily digital sanctuary.",
    rating: 5,
    initials: "ER",
  },
  {
    name: "David Park",
    role: "Studio Owner",
    content: "Finally a platform that understands the specific needs of a yoga community. The shared schemas and data integrity are top-notch. It's the backbone of my business now.",
    rating: 5,
    initials: "DP",
  },
  {
    name: "Aisha Jallow",
    role: "Mindfulness Coach",
    content: "A beautiful blend of technology and zen. Solara is the perfect companion for anyone on a journey to inner peace. It doesn't just manage data; it manages energy.",
    rating: 5,
    initials: "AJ",
  },
  {
    name: "James Wilson",
    role: "Daily Practitioner",
    content: "The best yoga management app I've used. Clean, fast, and reliable. It just works exactly how you want it to, allowing me to focus on my practice instead of my phone.",
    rating: 5,
    initials: "JW",
  }
];

export function Reviews() {
  return (
    <section className="py-16 relative overflow-hidden bg-background/50">
      {/* Abstract background shapes - kept extremely faint */}
      <div className="absolute top-0 left-1/4 size-96 bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 size-96 bg-accent/5 blur-[120px] rounded-full" />

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
          <p className="text-muted-foreground text-base max-w-sm leading-relaxed pb-1.5 border-l-2 border-primary/10 pl-6">
            Real stories from instructors and practitioners who found their center with Solara.
          </p>
        </div>

        {/* Masonry Wall */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className={cn(
                "break-inside-avoid relative group p-8 rounded-[1.5rem] border border-border/60 bg-card/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
              )}
            >
              <Quote className="absolute top-6 right-8 size-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity" />
              
              <div className="flex items-center gap-1 mb-6 text-primary/40">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "size-3",
                      i < review.rating ? "fill-current" : "opacity-20 text-muted-foreground"
                    )} 
                  />
                ))}
              </div>

              <p className="text-lg font-serif italic leading-relaxed mb-10 text-foreground/80 group-hover:text-foreground transition-colors">
                "{review.content}"
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-2xl bg-secondary/50 border border-border/40 text-primary flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-105">
                    {review.initials}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                      {review.name}
                      <CheckCircle2 className="size-3.5 text-primary opacity-40" />
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Metric */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 md:gap-32 opacity-50">
           <div className="text-center group cursor-default">
              <p className="text-4xl font-serif font-bold italic text-foreground/80 group-hover:text-primary transition-colors">12k+</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Mindful Souls</p>
           </div>
           <div className="text-center group cursor-default">
              <p className="text-4xl font-serif font-bold italic text-foreground/80 group-hover:text-primary transition-colors">400+</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Studios Connected</p>
           </div>
           <div className="text-center group cursor-default">
              <p className="text-4xl font-serif font-bold italic text-foreground/80 group-hover:text-primary transition-colors">98%</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Calm Index</p>
           </div>
        </div>
      </div>
    </section>
  );
}
