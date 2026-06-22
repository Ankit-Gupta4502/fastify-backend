import { cn } from "@/lib/utils";
import { faqs } from "./pricing-config";

export function PricingFAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 space-y-8">
      <div className="text-center space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Got questions?</p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Common Questions</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {faqs.map((faq) => {
          const Icon = faq.icon;
          return (
            <div
              key={faq.q}
              className={cn(
                "group relative p-6 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm",
                "hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 space-y-3",
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <Icon className="size-3.5 text-primary" />
                </div>
                <h4 className="font-bold text-sm leading-tight">{faq.q}</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-11">{faq.a}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
