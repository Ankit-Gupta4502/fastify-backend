import { zodResolver } from "@hookform/resolvers/zod";
import { createCorporateInquirySchema, type CreateCorporateInquiryBody } from "@yoga-app/shared";

export const corporateInquiryFormOptions = {
  resolver: zodResolver(createCorporateInquirySchema),
  defaultValues: {
    name: "",
    email: "",
    companyName: "",
    teamSize: undefined,
    phone: "",
    wellnessGoal: "",
  } satisfies Partial<CreateCorporateInquiryBody>,
};
