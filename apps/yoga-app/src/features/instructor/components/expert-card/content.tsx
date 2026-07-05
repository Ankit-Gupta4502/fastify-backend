import { useExpertCard } from "./context";

export function Content() {
  const { instructor } = useExpertCard();

  return (
    <div className="flex flex-col flex-1 px-4 pt-3.5 pb-1.5 space-y-1">
      <h3 className="font-serif text-lg leading-tight truncate group-hover:text-primary transition-colors duration-300">
        {instructor.name}
      </h3>
      {instructor.specialty[0] && (
        <p className="text-sm font-medium text-primary truncate">{instructor.specialty[0]}</p>
      )}
    </div>
  );
}
