import { createContext, useContext } from "react";
import type { InstructorListItem } from "@yoga-app/shared";

export interface ExpertCardCtx {
  instructor: InstructorListItem;
}

export const ExpertCardContext = createContext<ExpertCardCtx | null>(null);

export function useExpertCard() {
  const ctx = useContext(ExpertCardContext);
  if (!ctx) throw new Error("ExpertCard sub-components must be used inside <ExpertCard>");
  return ctx;
}
