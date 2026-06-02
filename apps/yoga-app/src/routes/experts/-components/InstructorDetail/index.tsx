import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicInstructorProfile } from "@yoga-app/shared";
import { InstructorDetailContext } from "./context";
import { pickGradient, statusConfig } from "./config";
import { HeroCard } from "./HeroCard";
import { Sidebar } from "./Sidebar";
import { Bio } from "./Bio";
import { Expertise } from "./Expertise";
import { Videos } from "./Videos";
import { Cta } from "./Cta";

export function InstructorDetail({ instructor }: { instructor: PublicInstructorProfile }) {
  const gradient = pickGradient(instructor.id);
  const status = statusConfig[instructor.status as keyof typeof statusConfig] ?? statusConfig.offline;

  return (
    <InstructorDetailContext.Provider value={{ instructor, gradient, status }}>
      <div className="py-8 space-y-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground gap-2">
          <Link to="/experts">
            <ArrowLeft className="size-4" />
            All Experts
          </Link>
        </Button>

        <HeroCard />

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          <Sidebar />
          <div className="space-y-10">
            <Bio />
            <Expertise />
            <Videos />
            <Cta />
          </div>
        </div>
      </div>
    </InstructorDetailContext.Provider>
  );
}
