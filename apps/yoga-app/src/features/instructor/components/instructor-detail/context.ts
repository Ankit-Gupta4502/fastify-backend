import { createContext, useContext } from "react";
import type { PublicInstructorProfile } from "@yoga-app/shared";

export interface InstructorDetailCtx {
  instructor: PublicInstructorProfile;
}

export const InstructorDetailContext = createContext<InstructorDetailCtx | null>(null);

export function useInstructorDetail() {
  const ctx = useContext(InstructorDetailContext);
  if (!ctx) throw new Error("Must be used inside <InstructorDetail>");
  return ctx;
}
