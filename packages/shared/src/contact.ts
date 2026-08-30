import { z } from "zod";
import { ORGANIZATION_SIZE_BANDS } from "./constants";

export const createContactQuerySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type CreateContactQueryBody = z.infer<typeof createContactQuerySchema>;

export type ContactQueryStatus = "new" | "resolved";

export interface AdminContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactQueryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactQueryResult {
  id: string;
}

export const createCorporateInquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Enter a valid work email").max(254),
  companyName: z.string().trim().min(1, "Company name is required").max(160),
  teamSize: z.enum(ORGANIZATION_SIZE_BANDS, "Select your team size"),
  phone: z.string().trim().max(30).optional(),
  wellnessGoal: z.string().trim().min(1, "Tell us what your team needs").max(2_000),
});

export type CreateCorporateInquiryBody = z.infer<typeof createCorporateInquirySchema>;

export interface AdminCorporateInquiry extends CreateCorporateInquiryBody {
  id: string;
  status: ContactQueryStatus;
  createdAt: string;
  updatedAt: string;
}
