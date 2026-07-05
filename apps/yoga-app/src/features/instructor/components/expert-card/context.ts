import { createContext, useContext } from "react";
import type { InstructorListItem } from "@yoga-app/shared";
import type { AccentConfig } from "./config";

export interface ExpertCardCtx {
  instructor: InstructorListItem;
  accent: AccentConfig;
}

export const ExpertCardContext = createContext<ExpertCardCtx | null>(null);

export function useExpertCard() {
  const ctx = useContext(ExpertCardContext);
  if (!ctx) throw new Error("ExpertCard sub-components must be used inside <ExpertCard>");
  return ctx;
}
