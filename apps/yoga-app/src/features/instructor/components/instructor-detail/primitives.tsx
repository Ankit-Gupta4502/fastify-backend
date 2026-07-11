export function ContentSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

export function ContentHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-serif font-medium">{children}</h2>;
}
