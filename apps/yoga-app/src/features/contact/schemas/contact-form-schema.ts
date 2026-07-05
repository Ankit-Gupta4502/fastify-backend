import { zodResolver } from "@hookform/resolvers/zod";
import { createContactQuerySchema, type CreateContactQueryBody } from "@yoga-app/shared";

export const contactFormOptions = {
  resolver: zodResolver(createContactQuerySchema),
  defaultValues: {
    name: "",
    email: "",
    subject: "",
    message: "",
  } satisfies CreateContactQueryBody,
};
