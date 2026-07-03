import type { InstructorListItem } from "@yoga-app/shared";
import { ExpertCardContext } from "./expert-card-context";
import { accentMap } from "./expert-card-config";
import { ExpertCardHeader } from "./ExpertCardHeader";
import { ExpertCardContent } from "./ExpertCardContent";
import { ExpertCardFooter } from "./ExpertCardFooter";

function ExpertCardRoot({
  instructor,
  index = 0,
  children,
}: {
  instructor: InstructorListItem;
  index?: number;
  children?: React.ReactNode;
}) {
  const accent = accentMap[index % 4];

  return (
    <ExpertCardContext.Provider value={{ instructor, accent }}>
      <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/70 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/25">
        {/* Primary half-circle decoration — left half visible, slides on hover */}
        <div className="absolute -right-24 -top-10 size-48 rounded-full bg-primary/30 blur-2xl transition-transform duration-500 group-hover:translate-x-3 group-hover:-translate-y-3" />
        {/* Glassmorphism overlay over top half of card */}
        <div className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-white/10 via-white/4 to-transparent backdrop-blur-xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {children ?? (
          <>
            <ExpertCardHeader />
            <ExpertCardContent />
            <ExpertCardFooter />
          </>
        )}
      </div>
    </ExpertCardContext.Provider>
  );
}

ExpertCardRoot.Header  = ExpertCardHeader;
ExpertCardRoot.Content = ExpertCardContent;
ExpertCardRoot.Footer  = ExpertCardFooter;

export const ExpertCard = ExpertCardRoot;
