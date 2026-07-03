/** Lightweight inline SVG doodle decorations — zero external dependencies. */

interface DoodleProps {
  className?: string;
  style?: React.CSSProperties;
}

export function StarDoodle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.3l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

export function CircleDoodle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="8 11" />
    </svg>
  );
}

export function WaveDoodle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 28" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M4,14 C18,4 28,24 44,14 C60,4 70,24 86,14 C102,4 112,18 118,12"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PlusDoodle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
