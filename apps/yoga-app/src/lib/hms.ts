const FALLBACK_SUBDOMAIN = "bookyouryogateacher.100ms.live";

export function hmsPrebuiltUrl(roomCode: string | null | undefined): string | null {
  if (!roomCode) return null;
  const subdomain =
    (import.meta.env.VITE_HMS_SUBDOMAIN as string | undefined) ||
    FALLBACK_SUBDOMAIN;
  const base = subdomain.startsWith("http")
    ? subdomain
    : `https://${subdomain}`;
  return `${base}/meeting/${roomCode}`;
}
