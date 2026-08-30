import { useEffect, useState } from "react";
import { intervalToDuration } from "date-fns";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  isPast: boolean;
}

export function useCountdown(targetUtc: string): TimeLeft {
  const compute = (): TimeLeft => {
    const now = new Date();
    const target = new Date(targetUtc);
    const diff = target.getTime() - now.getTime();
    if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isPast: true };
    // Within 15-min window = live join open
    const isLive = diff <= 15 * 60 * 1000;
    const duration = intervalToDuration({ start: now, end: target });
    return {
      days: duration.days ?? 0,
      hours: duration.hours ?? 0,
      minutes: duration.minutes ?? 0,
      seconds: duration.seconds ?? 0,
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
