import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, type CompleteOnboardingPayload } from "@/api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: CompleteOnboardingPayload) => userApi.completeOnboarding(payload),
    onSuccess: () => {
      // onboardingCompletedAt is now set server-side — reflect it locally so
      // the root gate doesn't bounce straight back to /onboarding.
      if (user) setUser({ ...user, onboardingCompletedAt: new Date().toISOString() });
      void qc.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
