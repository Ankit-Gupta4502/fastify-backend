import { User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface InstructorAvatarProps {
  src?: string | null;
  name?: string;
  /** Size + shape + shadow — applied to both the img and the fallback wrapper */
  className?: string;
  /** Background styling for the fallback (gradient, solid colour, blur, border) */
  fallbackClassName?: string;
  /** Text styling for initials inside the fallback */
  initialsClassName?: string;
}

export function InstructorAvatar({
  src,
  name,
  className,
  fallbackClassName,
  initialsClassName = "text-xl font-bold text-white",
}: InstructorAvatarProps) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : null;

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "Instructor"}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center justify-center", fallbackClassName, className)}>
      {initials ? (
        <span className={initialsClassName}>{initials}</span>
      ) : (
        <User className="size-8 text-primary/60" />
      )}
    </div>
  );
}
