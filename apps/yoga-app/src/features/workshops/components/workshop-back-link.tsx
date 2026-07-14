import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function WorkshopBackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" />
      Back to home
    </Link>
  );
}
