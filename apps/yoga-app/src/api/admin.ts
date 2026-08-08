import type {
  AdminPrivateSessionRequest,
  AdminUser,
  AdminUserDetail,
  AdminInstructor,
  AdminInstructorDetail,
  AdminInstructorSessionDetail,
  AdminInstructorSessionsFilters,
  AdminRoom,
  AssignPrivateSessionBody,
  CreateGroupRoomBody,
  CreateGroupRoomResult,
  CreateInstructorBody,
  PaginatedResult,
  UpdateGroupRoomBody,
  UpdateInstructorStatsBody,
} from "@yoga-app/shared";
import { API_ENDPOINTS } from "@yoga-app/shared";
import { apiRequest } from "../lib/http";

export interface AdminPlan {
  id: string;
  name: string;
  category: string;
  billingInterval: string;
  sessionsPerWeek: number | null;
  sessionsPerMonth: number | null;
  allowsPrivate: boolean;
  allowsTimeFlexibility: boolean;
  maxRoomCapacity: number | null;
  priceCents: number | null;
  priceInrPaise: number | null;
  pricePerSessionCents: number | null;
  pricePerSessionInrPaise: number | null;
  createdAt: string;
}

export interface CreatePlanBody {
  name: string;
  category?: string;
  billingInterval?: "week" | "month";
  sessionsPerWeek?: number | null;
  sessionsPerMonth?: number | null;
  allowsPrivate?: boolean;
  allowsTimeFlexibility?: boolean;
  maxRoomCapacity?: number | null;
  priceCents?: number | null;
  priceInrPaise?: number | null;
  pricePerSessionCents?: number | null;
  pricePerSessionInrPaise?: number | null;
}

export type UpdatePlanBody = Partial<CreatePlanBody>;

export interface AdminCorporatePlan {
  id: string;
  name: string;
  linkedPlanId: string;
  linkedPlanName: string;
  billingInterval: string;
  createdAt: string;
}

export interface CreateCorporatePlanBody {
  name: string;
  linkedPlanId: string;
  billingInterval?: "week" | "month";
}

export type UpdateCorporatePlanBody = Partial<CreateCorporatePlanBody>;

export interface AdminOrganizationSummary {
  id: string;
  name: string;
  sizeBand: string;
  createdAt: string;
  memberCount: number;
  billingApprovedAt: string | null;
  pricePerSeatCents: number | null;
  pricePerSeatInrPaise: number | null;
}

export interface SetOrganizationPricingBody {
  pricePerSeatCents?: number | null;
  pricePerSeatInrPaise?: number | null;
}

export type SetOrganizationCouponBody =
  | { type: "percent"; value: number }
  | { type: "flat"; value: number };

export interface AdminUsersFilters {
  search?: string;
  role?: string;
  plan?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const adminApi = {
  listUsers: (filters?: AdminUsersFilters) => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.role) params.role = filters.role;
    if (filters?.plan) params.plan = filters.plan;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = String(filters.page);
    if (filters?.pageSize) params.pageSize = String(filters.pageSize);
    return apiRequest<PaginatedResult<AdminUser>>(API_ENDPOINTS.ADMIN.USERS, {
      params: Object.keys(params).length ? params : undefined,
    });
  },

  getUserDetail: (id: string) =>
    apiRequest<AdminUserDetail>(API_ENDPOINTS.ADMIN.USER_DETAIL(id)),

  listInstructors: () =>
    apiRequest<AdminInstructor[]>(API_ENDPOINTS.ADMIN.INSTRUCTORS),

  getInstructorDetail: (id: string, filters?: AdminInstructorSessionsFilters) => {
    const params: Record<string, string> = {};
    if (filters?.page) params.page = String(filters.page);
    if (filters?.pageSize) params.pageSize = String(filters.pageSize);
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    return apiRequest<AdminInstructorDetail>(API_ENDPOINTS.ADMIN.INSTRUCTOR_DETAIL(id), {
      params: Object.keys(params).length ? params : undefined,
    });
  },

  getInstructorSessionDetail: (instructorId: string, roomId: string) =>
    apiRequest<AdminInstructorSessionDetail>(
      API_ENDPOINTS.ADMIN.INSTRUCTOR_SESSION_DETAIL(instructorId, roomId),
    ),

  createInstructor: (body: CreateInstructorBody) =>
    apiRequest<{ id: string; name: string; email: string }>(API_ENDPOINTS.ADMIN.INSTRUCTORS, {
      method: "POST",
      data: body,
    }),

  approveInstructor: (id: string, approve: boolean) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.APPROVE_INSTRUCTOR(id), {
      method: "PATCH",
      data: { approve },
    }),

  updateInstructorPriority: (id: string, sortOrder: number) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.UPDATE_INSTRUCTOR_PRIORITY(id), {
      method: "PATCH",
      data: { sortOrder },
    }),

  updateInstructorStats: (id: string, body: UpdateInstructorStatsBody) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.UPDATE_INSTRUCTOR_STATS(id), {
      method: "PATCH",
      data: body,
    }),

  listGroupRooms: () =>
    apiRequest<AdminRoom[]>(API_ENDPOINTS.ADMIN.GROUP_ROOMS),

  createGroupRoom: (body: CreateGroupRoomBody) =>
    apiRequest<CreateGroupRoomResult>(API_ENDPOINTS.ADMIN.GROUP_ROOMS, {
      method: "POST",
      data: body,
    }),

  updateGroupRoom: (id: string, body: UpdateGroupRoomBody) =>
    apiRequest<CreateGroupRoomResult>(API_ENDPOINTS.ADMIN.UPDATE_GROUP_ROOM(id), {
      method: "PATCH",
      data: body,
    }),

  cancelGroupRoom: (id: string) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.CANCEL_GROUP_ROOM(id), {
      method: "DELETE",
    }),

  listPrivateRequests: (status: "pending" | "approved" | "rejected" = "pending") =>
    apiRequest<AdminPrivateSessionRequest[]>(API_ENDPOINTS.ADMIN.PRIVATE_REQUESTS(status)),

  assignPrivateRequest: (id: string, body: AssignPrivateSessionBody) =>
    apiRequest<{ roomId: string }>(API_ENDPOINTS.ADMIN.ASSIGN_PRIVATE_REQUEST(id), {
      method: "PATCH",
      data: body,
    }),

  rejectPrivateRequest: (id: string, adminNote?: string | null) =>
    apiRequest<null>(API_ENDPOINTS.ADMIN.REJECT_PRIVATE_REQUEST(id), {
      method: "PATCH",
      data: { adminNote: adminNote ?? null },
    }),

  listPlans: () => apiRequest<AdminPlan[]>(API_ENDPOINTS.ADMIN.PLANS),

  createPlan: (body: CreatePlanBody) =>
    apiRequest<AdminPlan>(API_ENDPOINTS.ADMIN.PLANS, { method: "POST", data: body }),

  updatePlan: (id: string, body: UpdatePlanBody) =>
    apiRequest<AdminPlan>(API_ENDPOINTS.ADMIN.UPDATE_PLAN(id), { method: "PATCH", data: body }),

  listCorporatePlans: () => apiRequest<AdminCorporatePlan[]>(API_ENDPOINTS.ADMIN.CORPORATE_PLANS),

  createCorporatePlan: (body: CreateCorporatePlanBody) =>
    apiRequest<AdminCorporatePlan>(API_ENDPOINTS.ADMIN.CORPORATE_PLANS, { method: "POST", data: body }),

  updateCorporatePlan: (id: string, body: UpdateCorporatePlanBody) =>
    apiRequest<AdminCorporatePlan>(API_ENDPOINTS.ADMIN.UPDATE_CORPORATE_PLAN(id), {
      method: "PATCH",
      data: body,
    }),

  listOrganizations: () =>
    apiRequest<AdminOrganizationSummary[]>(API_ENDPOINTS.ADMIN.ORGANIZATIONS),

  setOrganizationBillingApproval: (id: string, approved: boolean) =>
    apiRequest<{ success: true }>(API_ENDPOINTS.ADMIN.SET_ORGANIZATION_BILLING_APPROVAL(id), {
      method: "PATCH",
      data: { approved },
    }),

  setOrganizationPricing: (id: string, body: SetOrganizationPricingBody) =>
    apiRequest<{ success: true }>(API_ENDPOINTS.ADMIN.SET_ORGANIZATION_PRICING(id), {
      method: "PATCH",
      data: body,
    }),

  setOrganizationCoupon: (id: string, body: SetOrganizationCouponBody) =>
    apiRequest<{ code: string }>(API_ENDPOINTS.ADMIN.SET_ORGANIZATION_COUPON(id), {
      method: "PATCH",
      data: body,
    }),
};
