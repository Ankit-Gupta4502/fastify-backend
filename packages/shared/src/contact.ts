import { z } from "zod";

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
