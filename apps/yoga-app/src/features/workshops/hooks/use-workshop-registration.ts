import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Workshop } from "@yoga-app/shared";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useWorkshopCheckout } from "@/features/workshops/hooks/use-workshops";

/**
 * Wraps useWorkshopCheckout with the "unauthenticated → login → come back and
 * finish" round trip: if the user isn't signed in, register() sends them to
 * /login with a redirect back to this exact URL (plus a register=1 flag).
 * Once they return authenticated, the flag is picked up and the checkout is
 * triggered automatically — no extra click needed.
 */
export function useWorkshopRegistration(workshop: Workshop) {
  const checkout = useWorkshopCheckout(workshop);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTriggered = useRef(false);

  const register = useCallback(() => {
    if (!isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      params.set("register", "1");
      navigate({ to: "/login", search: { redirect: `${window.location.pathname}?${params.toString()}` } });
      return;
    }
    setError(null);
    checkout.mutate(undefined, {
      onSuccess: () => setDone(true),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Could not register";
        if (msg !== "Payment cancelled") setError(msg);
      },
    });
  }, [isAuthenticated, checkout, navigate]);

  useEffect(() => {
    if (!isAuthenticated || autoTriggered.current || done) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("register") !== "1") return;
    autoTriggered.current = true;
    params.delete("register");
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", clean);
    register();
  }, [isAuthenticated, done, register]);

  return { register, done, error, isPending: checkout.isPending };
}
