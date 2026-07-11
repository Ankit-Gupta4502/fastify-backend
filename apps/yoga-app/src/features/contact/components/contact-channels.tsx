import { CONTACT_CHANNELS } from "@/features/contact/constants";
import { cn } from "@/shared/lib/utils";

export function ContactChannels() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-foreground/70 uppercase tracking-widest">Reach us directly</p>
      <div className="space-y-3">
        {CONTACT_CHANNELS.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-md",
                c.color
              )}
            >
              <div className="size-9 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5 shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">{c.label}</p>
                <p className="text-sm font-semibold truncate">{c.value}</p>
              </div>
            </a>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground pt-2">
        For the fastest response, reach us on WhatsApp or email. We typically reply within a few hours during business hours (Mon–Sat, 9 am–7 pm IST).
      </p>
    </div>
  );
}
