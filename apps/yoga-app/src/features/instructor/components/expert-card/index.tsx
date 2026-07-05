import { Link } from "@tanstack/react-router";
import type { InstructorListItem } from "@yoga-app/shared";
import { ExpertCardContext } from "./context";
import { Header } from "./header";
import { Content } from "./content";
import { Footer } from "./footer";

function ExpertCardRoot({
  instructor,
  children,
}: {
  instructor: InstructorListItem;
  children?: React.ReactNode;
}) {
  return (
    <ExpertCardContext.Provider value={{ instructor }}>
      <Link
        to="/experts/$expertId"
        params={{ expertId: instructor.id }}
        className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
      >
        {children ?? (
          <>
            <Header />
            <Content />
            <Footer />
          </>
        )}
      </Link>
    </ExpertCardContext.Provider>
  );
}

ExpertCardRoot.Header  = Header;
ExpertCardRoot.Content = Content;
ExpertCardRoot.Footer  = Footer;

export const ExpertCard = ExpertCardRoot;
