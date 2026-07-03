import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ChipVariant = "primary" | "muted" | "success" | "warning" | "info";
type ChipSize = "sm" | "md";

const variantClasses: Record<ChipVariant, string> = {
  primary: "bg-primary/10 text-primary border-primary/15",
  muted: "bg-muted text-muted-foreground border-border/50",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const dotColorClasses: Record<ChipVariant, string> = {
  primary: "bg-primary/40",
  muted: "bg-muted-foreground/40",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const sizeClasses: Record<ChipSize, string> = {
  sm: "text-[10px] px-2.5 py-0.5",
  md: "text-xs px-3 py-1.5",
};

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: LucideIcon;
  dot?: boolean;
  pulseDot?: boolean;
  className?: string;
}

export function Chip({
  children,
  variant = "primary",
  size = "sm",
  icon: Icon,
  dot,
  pulseDot,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {(dot || pulseDot) && (
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0",
            dotColorClasses[variant],
            pulseDot && "animate-pulse",
          )}
        />
      )}
      {Icon && <Icon className="size-3 shrink-0" />}
      {children}
    </span>
  );
}
