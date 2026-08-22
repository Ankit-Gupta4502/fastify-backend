import { Link } from "@tanstack/react-router";
import { ArrowLeft,Verified } from "lucide-react";

export function TopBar() {
  return (
    <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
      <Link
        to="/experts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        All Experts
      </Link>

      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Verified className=" text-green-600" />
        Verified Instructor
      </div>
    </div>
  );
}
