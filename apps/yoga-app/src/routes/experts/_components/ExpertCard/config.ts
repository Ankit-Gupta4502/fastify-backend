import { Radio, Clock, WifiOff } from "lucide-react";

export type AccentConfig = { gradient: string; badge: string; avatar: string };

export const accentMap: Record<number, AccentConfig> = {
  0: { gradient: "from-violet-500/20 via-purple-500/10 to-transparent", badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400", avatar: "from-violet-500 to-purple-600" },
  1: { gradient: "from-emerald-500/20 via-teal-500/10 to-transparent", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", avatar: "from-emerald-500 to-teal-600" },
  2: { gradient: "from-rose-500/20 via-pink-500/10 to-transparent", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400", avatar: "from-rose-500 to-pink-600" },
  3: { gradient: "from-amber-500/20 via-orange-500/10 to-transparent", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400", avatar: "from-amber-500 to-orange-600" },
};

export const statusConfig = {
  available: { icon: Radio,   label: "Available",  className: "text-emerald-500 bg-emerald-500/10" },
  busy:      { icon: Clock,   label: "In Session", className: "text-amber-500 bg-amber-500/10" },
  offline:   { icon: WifiOff, label: "Offline",    className: "text-muted-foreground bg-muted/50" },
};
