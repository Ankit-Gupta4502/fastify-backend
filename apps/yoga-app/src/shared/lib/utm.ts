const UTM_KEY = "utm_data";
const ACQUISITION_SAVED_KEY = "utm_acquisition_saved";

export interface UtmData {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  landingPage: string | null;
}

/** Call on every page load — persists first-touch UTM params to localStorage. */
export function captureUtm(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite an already-captured first-touch
  if (localStorage.getItem(UTM_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  const utmTerm = params.get("utm_term");

  // Only store if there's something worth recording
  const hasUtm = utmSource || utmMedium || utmCampaign;
  const referrer = document.referrer || null;
  const landingPage = window.location.pathname + window.location.search;

  if (hasUtm || referrer) {
    const data: UtmData = {
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      referrer,
      landingPage,
    };
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
  }
}

export function getStoredUtm(): UtmData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(UTM_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as UtmData; } catch { return null; }
}

export function clearUtm(): void {
  if (typeof window !== "undefined") localStorage.removeItem(UTM_KEY);
}

/**
 * Acquisition (first-touch marketing attribution) is saved once per user, but the
 * underlying UTM data must stick around beyond that — a pending workshop
 * registration (e.g. sign up -> verify email -> auto-register) still needs to read
 * utm_source to price/checkout correctly. Track "already saved" separately instead
 * of deleting the UTM data itself.
 */
export function hasSavedAcquisition(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ACQUISITION_SAVED_KEY) === "1";
}

export function markAcquisitionSaved(): void {
  if (typeof window !== "undefined") localStorage.setItem(ACQUISITION_SAVED_KEY, "1");
}
