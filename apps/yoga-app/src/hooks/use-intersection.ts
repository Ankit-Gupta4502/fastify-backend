import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref and a boolean that becomes true once the element enters
 * the viewport. Automatically disconnects after first intersection —
 * ideal for one-shot scroll-triggered animations (Vercel best practice:
 * defer non-critical work until visible).
 */
export function useIntersection<T extends Element>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // fire once, then clean up
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px", ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // stable ref — empty deps is intentional

  return [ref, isVisible];
}
