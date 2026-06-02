import { Radio, Clock, WifiOff } from "lucide-react";

export const statusConfig = {
  available: { icon: Radio,   label: "Available",  className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  busy:      { icon: Clock,   label: "In Session", className: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  offline:   { icon: WifiOff, label: "Offline",    className: "text-muted-foreground bg-muted/50 border-border/30" },
};

export const accentColors = [
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
];

export function pickGradient(id: string) {
  return accentColors[Math.abs(id.charCodeAt(0) + id.charCodeAt(1)) % accentColors.length];
}
