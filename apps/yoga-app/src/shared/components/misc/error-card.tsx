interface ErrorCardProps {
  message?: string;
}

export function ErrorCard({ message = "Something went wrong. Please try again." }: ErrorCardProps) {
  return (
    <div className="rounded-2xl bg-destructive/5 border border-destructive/30 text-destructive p-6 text-sm">
      {message}
    </div>
  );
}
