import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "@/api";
import { openRazorpayCheckout, type RazorpayCheckoutResponse } from "@/shared/lib/razorpay";
import { queryKeys } from "@/lib/react-query/query-keys";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useSeatPurchase(organizationId: string) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    retry: 1,
    mutationFn: async ({
      corporatePlanId,
      seats,
      country,
    }: {
      corporatePlanId: string;
      seats: number;
      country?: string;
    }) => {
      const order = await organizationsApi.createSeatPurchase(organizationId, {
        corporatePlanId,
        seats,
        country,
      });
      if (!order.data) throw new Error("Seat purchase creation failed");

      const { subscriptionId, keyId } = order.data;

      const checkout: RazorpayCheckoutResponse = await openRazorpayCheckout({
        key: keyId,
        name: "Book Your Yoga Teacher — Corporate",
        description: `${seats} seat${seats === 1 ? "" : "s"}`,
        subscription_id: subscriptionId,
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: { color: "#D97706" },
        handler: () => {},
      });

      if (!checkout.razorpay_subscription_id) {
        throw new Error("Subscription ID missing from payment response");
      }

      const verification = await organizationsApi.verifySeatPurchase(organizationId, {
        razorpaySubscriptionId: checkout.razorpay_subscription_id,
        razorpayPaymentId: checkout.razorpay_payment_id,
        razorpaySignature: checkout.razorpay_signature,
      });

      if (!verification.data?.success) {
        throw new Error(verification.message || "Payment verification failed");
      }

      return verification.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.organizations.members(organizationId) });
    },
  });
}
