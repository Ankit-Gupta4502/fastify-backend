import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { InstructorListItem } from "@yoga-app/shared";
import { CardContext } from "./card-context";
import { CardMedia } from "./Card.Media";
import { CardBody } from "./Card.Body";
import { CARD_GRADIENTS, statusMap } from "./config";

function CardRoot({
  instructor,
  index,
  children,
}: {
  instructor: InstructorListItem;
  index: number;
  children?: React.ReactNode;
}) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const status = statusMap[instructor.status] ?? statusMap.offline;

  return (
    <CardContext.Provider value={{ instructor, status }}>
      <Link
        to="/experts/$expertId"
        params={{ expertId: instructor.id }}
        className={cn(
          "group flex-none w-60 rounded-3xl border border-border/50 bg-linear-to-br bg-card/80 overflow-hidden",
          "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300",
          "sketch-border-sm",
          gradient,
        )}
      >
        {children ?? (
          <>
            <CardMedia />
            <CardBody />
          </>
        )}
      </Link>
    </CardContext.Provider>
  );
}

CardRoot.Media = CardMedia;
CardRoot.Body  = CardBody;

export const Card = CardRoot;
