import ReactPlayer from "react-player";
import { useInstructorDetail } from "./context";
import { ContentSection, ContentHeading } from "./primitives";

export function Videos() {
  const { instructor } = useInstructorDetail();
  if (!instructor.introVideoUrl) return null;

  return (
    <ContentSection>
      <ContentHeading>Meet {instructor.name.split(" ")[0]}</ContentHeading>
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_24px_50px_-28px_rgba(0,0,0,0.35)]">
        <ReactPlayer
          src={instructor.introVideoUrl}
          poster={instructor.profileImageUrl ?? undefined}
          controls
          playsInline
          width="100%"
          height="100%"
        />
      </div>
    </ContentSection>
  );
}
