import { useEffect, useState } from "react";

export interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  isPast: boolean;
}

export function useCountdown(targetUtc: string): TimeLeft {
  const compute = (): TimeLeft => {
    const diff = new Date(targetUtc).getTime() - Date.now();
    if (diff < 0) return { hours: 0, minutes: 0, seconds: 0, isLive: false, isPast: true };
    // Within 15-min window = live join open
    const isLive = diff <= 15 * 60 * 1000;
    return {
      hours: Math.floor(diff / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
      isLive,
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(compute), 1_000);
    return () => clearInterval(id);
  }, [targetUtc]); // re-subscribe only if the target changes

  return timeLeft;
}
