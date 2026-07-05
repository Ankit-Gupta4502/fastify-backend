import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
  title: string;
  description?: string;
  backTo: string;
  backLabel?: string;
}

export function NotFound({ title, description, backTo, backLabel = "Go back" }: NotFoundProps) {
  return (
    <div className="py-20 text-center space-y-4">
      <p className="text-4xl font-serif font-bold text-muted-foreground/30">404</p>
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
      <Button asChild variant="outline" className="rounded-full mt-4">
        <Link to={backTo as never}>{backLabel}</Link>
      </Button>
    </div>
  );
}
