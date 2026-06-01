import type { InstructorListItem } from "@yoga-app/shared";
import { ExpertCardContext } from "./context";
import { accentMap } from "./config";
import { Header } from "./Header";
import { Content } from "./Content";
import { Footer } from "./Footer";

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
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {children ?? (
          <>
            <Header />
            <Content />
            <Footer />
          </>
        )}
      </div>
    </ExpertCardContext.Provider>
  );
}

ExpertCardRoot.Header  = Header;
ExpertCardRoot.Content = Content;
ExpertCardRoot.Footer  = Footer;

export const ExpertCard = ExpertCardRoot;
