import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../api";

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => paymentsApi.cancel(subscriptionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.plans.mine() });
    },
  });
}
import {
  openRazorpayCheckout,
  type RazorpayCheckoutResponse,
} from "../lib/razorpay";
import { queryKeys } from "../lib/react-query/query-keys";
import { useAuthStore } from "../store/auth.store";

function indiaSubscriptionCheckoutConfig() {
  return {
    display: {
      hide: [
        { method: "upi" as const, flow: "qr" as const },
        { method: "upi" as const, flow: "collect" as const },
      ],
      preferences: { show_default_blocks: true },
    },
  };
}

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
      if (!order.data) throw new Error("Subscription creation failed");

      const { subscriptionId, keyId, planName: resolvedPlanName } = order.data;

      const checkout: RazorpayCheckoutResponse = await openRazorpayCheckout({
        key: keyId,
        name: "Book Your Yoga Teacher",
        description: `${resolvedPlanName} — ${sessionCount} sessions/mo`,
        subscription_id: subscriptionId,
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: { color: "#D97706" },
        config: country === "IN" ? indiaSubscriptionCheckoutConfig() : undefined,
        handler: () => {},
      });

      if (!checkout.razorpay_subscription_id) throw new Error("Subscription ID missing from payment response");

      if (!checkout.razorpay_subscription_id) throw new Error("Subscription ID missing from payment response");

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

export function useCheckout() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    retry: 1,
    mutationFn: async ({ planId, country }: { planId: string; country?: string }) => {
      const order = await paymentsApi.createOrder({ planId, country });
      if (!order.data) {
        throw new Error("Subscription creation failed");
      }

      const { subscriptionId, keyId, planName } = order.data;

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
        config: country === "IN" ? indiaSubscriptionCheckoutConfig() : undefined,
        handler: () => {},
      });

      if (!checkout.razorpay_subscription_id) throw new Error("Subscription ID missing from payment response");

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
