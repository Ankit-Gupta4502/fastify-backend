import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../api";
import {
  openRazorpayCheckout,
  type RazorpayCheckoutResponse,
} from "../lib/razorpay";
import { queryKeys } from "../lib/react-query/query-keys";
import { useAuthStore } from "../store/auth.store";

export function useCheckout() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (planId: string) => {
      const order = await paymentsApi.createOrder({ planId });
      if (!order.data) {
        throw new Error("Order creation failed");
      }
      const { orderId, keyId, amount, currency, planName } = order.data;

      const checkout: RazorpayCheckoutResponse = await openRazorpayCheckout({
        key: keyId,
        amount,
        currency,
        name: "Solara Yoga",
        description: `Plan: ${planName}`,
        order_id: orderId,
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: { color: "#d96b3a" },
        handler: () => {},
      });

      const verification = await paymentsApi.verify({
        planId,
        razorpayOrderId: checkout.razorpay_order_id,
        razorpayPaymentId: checkout.razorpay_payment_id,
        razorpaySignature: checkout.razorpay_signature,
      });

      if (!verification.data?.success) {
        throw new Error(verification.message || "Payment verification failed");
      }

      return verification.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.plans.mine() });
      void qc.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
