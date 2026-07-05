import { cn } from "@/shared/lib/utils";

export function SideCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-border/50 bg-card/60 sketch-border-sm p-5 space-y-3", className)}>
      {children}
    </div>
  );
}

export function SideCardLabel({
  icon: Icon,
  children,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="size-3.5 text-primary/60" />}
      <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">{children}</h3>
    </div>
  );
}

export function ContentSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function ContentHeading({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <h3 className="text-2xl font-serif font-bold">
      {accent ? (
        <>
          {children}{" "}
          <span className="font-doodle italic text-primary doodle-underline">{accent}</span>
        </>
      ) : (
        children
      )}
    </h3>
  );
}
