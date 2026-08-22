import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
