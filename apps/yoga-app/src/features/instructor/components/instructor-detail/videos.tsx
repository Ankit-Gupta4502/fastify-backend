import { Play, ExternalLink } from "lucide-react";
import { useInstructorDetail } from "./context";
import { ContentSection, ContentHeading } from "./primitives";

export function Videos() {
  const { instructor } = useInstructorDetail();
  if (instructor.videoLinks.length === 0) return null;

  return (
    <ContentSection>
      <ContentHeading>Featured Videos</ContentHeading>
      <div className="divide-y divide-border/60 border-y border-border/60">
        {instructor.videoLinks.map((url) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-4 group"
          >
            <span className="size-8 rounded-full border border-border flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
              <Play className="size-3.5 fill-primary" />
            </span>
            <span className="text-sm font-medium text-primary truncate flex-1">{url}</span>
            <ExternalLink className="size-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </ContentSection>
  );
}
