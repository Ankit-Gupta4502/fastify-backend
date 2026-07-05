import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; to: string };
  variant?: "dashed" | "plain";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "dashed",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-8 text-center space-y-3",
        variant === "dashed" && "border border-dashed border-border/60",
        className,
      )}
    >
      {Icon && <Icon className="size-7 text-primary/50 mx-auto" />}
      <p className="font-bold">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button asChild className="rounded-full">
          <Link to={action.to as never}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
