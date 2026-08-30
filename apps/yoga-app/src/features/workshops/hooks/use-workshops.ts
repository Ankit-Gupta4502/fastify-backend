import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workshopsApi } from "@/api/workshops";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { Workshop, WorkshopJoinBody, CreateWorkshopBody, UpdateWorkshopBody } from "@yoga-app/shared";
import { openRazorpayCheckout } from "@/shared/lib/razorpay";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getStoredUtm } from "@/shared/lib/utm";
import { ApiRequestError } from "@/lib/http";

export function useWorkshops() {
  return useQuery(workshopQueryOptions.list());
}

export const workshopQueryOptions = {
  list: () =>
    queryOptions({
      queryKey: queryKeys.workshops.list(),
      queryFn: workshopsApi.list,
      staleTime: 60_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.workshops.detail(id),
      queryFn: () => workshopsApi.detail(id),
      staleTime: 60_000,
      enabled: !!id,
    }),
};

export function useWorkshop(id: string) {
  return useQuery(workshopQueryOptions.detail(id));
}

export function useJoinWorkshop() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: WorkshopJoinBody }) =>
      workshopsApi.join(id, body),
  });
}

export function useWorkshopCheckout(workshop: Workshop) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const utm = getStoredUtm();
      const utmSource = utm?.utmSource ?? null;

      if (!utmSource) {
        await workshopsApi.join(workshop.id, { utmSource: null });
        return;
      }

      // Ask the backend whether payment is needed for this country. The backend
      // returns amount=0 when the UTM price is zero for the user's country.
      const orderRes = await workshopsApi.createOrder(workshop.id);
      if (!orderRes.data) throw new Error("Could not create payment order");

      const { orderId, keyId, amount, currency } = orderRes.data;

      if (amount === 0 || !orderId) {
        // Backend decided this country pays nothing — enroll for free
        await workshopsApi.join(workshop.id, { utmSource });
        return;
      }

      const checkout = await openRazorpayCheckout({
        key: keyId,
        amount,
        currency,
        name: "Book Your Yoga Teacher",
        description: workshop.name,
        order_id: orderId,
        prefill: { name: user?.name ?? undefined, email: user?.email ?? undefined },
        theme: { color: "#D97706" },
        handler: () => {},
      });

      // Retry the join up to 3 times in case of a transient network error after payment succeeds.
      // The server's unique(razorpayOrderId) constraint makes re-submitting the same proof idempotent.
      let lastErr: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await workshopsApi.join(workshop.id, {
            utmSource,
            razorpayOrderId: checkout.razorpay_order_id,
            razorpayPaymentId: checkout.razorpay_payment_id,
            razorpaySignature: checkout.razorpay_signature,
          });
          return;
        } catch (err) {
          // A 409 here means an earlier attempt in this same loop already succeeded (the
          // response was just lost in transit) — this user IS registered and charged, so
          // treat it as success rather than surfacing an error for a completed registration.
          if (err instanceof ApiRequestError && err.status === 409) return;
          lastErr = err;
          if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
      throw lastErr;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workshops.detail(workshop.id) });
      void qc.invalidateQueries({ queryKey: queryKeys.workshops.list() });
    },
  });
}

export function useAdminWorkshops() {
  return useQuery({
    queryKey: queryKeys.admin.workshops(),
    queryFn: workshopsApi.adminList,
    staleTime: 30_000,
  });
}

export function useCreateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkshopBody) => workshopsApi.adminCreate(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.workshops() }),
  });
}

export function useUpdateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateWorkshopBody }) =>
      workshopsApi.adminUpdate(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.workshops() }),
  });
}

export function useDeleteWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workshopsApi.adminDelete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.workshops() }),
  });
}
