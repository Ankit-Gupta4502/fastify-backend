import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../api";
import {
  openRazorpayCheckout,
  type RazorpayCheckoutResponse,
} from "../lib/razorpay";
import { queryKeys } from "../lib/react-query/query-keys";
import { useAuthStore } from "../store/auth.store";


export function useCustomCheckout() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    retry: 1,
    mutationFn: async ({
      sessionCount,
      planName,
      country,
    }: {
      sessionCount: number;
      planName: "private" | "prenatal_postnatal" | "therapeutic_yoga";
      country?: string;
    }) => {
      const order = await paymentsApi.createCustomOrder({ sessionCount, planName, country });
      if (!order.data) throw new Error("Order creation failed");

      const { orderId, keyId, amount, currency } = order.data;
      const isIndia = currency === "INR";

      const checkout: RazorpayCheckoutResponse = await openRazorpayCheckout({
        key: keyId,
        amount,
        currency,
        name: "Book Your Yoga Teacher",
        description: `${planName} — ${sessionCount} sessions/mo`,
        order_id: orderId,
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: { color: "#D97706" },
        config: isIndia ? { display: { preferences: { show_default_blocks: true } } } : undefined,
        handler: () => {},
      });

      const verification = await paymentsApi.verify({
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

export function useCheckout() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    retry: 3,
    mutationFn: async ({ planId, country }: { planId: string; country?: string }) => {
      const order = await paymentsApi.createOrder({ planId, country });
      if (!order.data) {
        throw new Error("Order creation failed");
      }

      const { subscriptionId, keyId, planName } = order.data;
      if (!subscriptionId) throw new Error("Expected subscriptionId for recurring plan");

      // Subscription checkout: pass subscription_id instead of order_id.
      // Razorpay handles the first authorisation charge and all renewals.
      const checkout: RazorpayCheckoutResponse = await openRazorpayCheckout({
        key: keyId,
        name: "Book Your Yoga Teacher",
        description: `Plan: ${planName}`,
        subscription_id: subscriptionId,
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: { color: "#D97706" },
        config: country === "IN" ? { display: { preferences: { show_default_blocks: true } } } : undefined,
        handler: () => {},
      });

      const verification = await paymentsApi.verify({
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
      void qc.invalidateQueries({ queryKey: queryKeys.plans.mine() });
      void qc.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
