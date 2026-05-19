import {
  API_ENDPOINTS,
  type CreateOrderBody,
  type CreateCustomOrderBody,
  type CreateOrderResult,
  type VerifyPaymentBody,
  type VerifyPaymentResult,
} from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export const paymentsApi = {
  createOrder: (payload: CreateOrderBody) =>
    apiRequest<CreateOrderResult>(API_ENDPOINTS.PAYMENTS.CREATE_ORDER, {
      method: "POST",
      data: payload,
    }),

  createCustomOrder: (payload: CreateCustomOrderBody) =>
    apiRequest<CreateOrderResult>(API_ENDPOINTS.PAYMENTS.CREATE_CUSTOM_ORDER, {
      method: "POST",
      data: payload,
    }),

  verify: (payload: VerifyPaymentBody) =>
    apiRequest<VerifyPaymentResult>(API_ENDPOINTS.PAYMENTS.VERIFY, {
      method: "POST",
      data: payload,
    }),
};
