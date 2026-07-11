import type { PublicInstructorProfile } from "@yoga-app/shared";
import { InstructorDetailContext } from "./context";
import { TopBar } from "./top-bar";
import { Hero } from "./hero";
import { Bio } from "./bio";
import { Expertise } from "./expertise";
import { RatingsPanel } from "./ratings-panel";
import { Videos } from "./videos";
import { MoreInstructors } from "./more-instructors";

export function InstructorDetail({ instructor }: { instructor: PublicInstructorProfile }) {
  return (
    <InstructorDetailContext.Provider value={{ instructor }}>
      <div className="py-8 sm:py-12 space-y-14 sm:space-y-20">
        <TopBar />
        <Hero />
        <Bio />
        <Expertise />
        <RatingsPanel />
        <Videos />
        <MoreInstructors />
      </div>
    </InstructorDetailContext.Provider>
  );
}
