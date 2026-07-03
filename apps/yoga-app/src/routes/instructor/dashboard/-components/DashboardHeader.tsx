import { Link } from "@tanstack/react-router";
import { UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { INSTRUCTOR_TIMEZONE_LABEL } from "@/constants/sessions";

interface DashboardHeaderProps {
  firstName: string | undefined;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
          Instructor Console
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Hello, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Your schedule is shown in{" "}
          <span className="font-medium">{INSTRUCTOR_TIMEZONE_LABEL}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 self-start md:self-auto">
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <span className="size-2 rounded-full bg-emerald-500 mr-2 animate-pulse inline-block" />
          Available
        </Badge>
        <Link
          to="/instructor/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors border border-border/60 px-3 py-2 rounded-full hover:border-primary/40"
        >
          <UserCircle className="size-3.5" />
          Edit profile
        </Link>
      </div>
    </div>
  );
}
