export const CARD_GRADIENTS = [
  "from-sky-500/10 to-blue-400/5",
  "from-primary/10 to-amber-400/5",
  "from-emerald-500/10 to-teal-400/5",
  "from-violet-500/10 to-purple-400/5",
  "from-rose-500/10 to-pink-400/5",
];

export const statusMap: Record<string, { color: string; label: string }> = {
  available: { color: "bg-emerald-500",        label: "Available"  },
  busy:      { color: "bg-amber-500",           label: "In session" },
  offline:   { color: "bg-muted-foreground/40", label: "Offline"    },
};
