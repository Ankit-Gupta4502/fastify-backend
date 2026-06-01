import { createContext, useContext } from "react";
import type { InstructorListItem } from "@yoga-app/shared";

export interface CardCtx {
  instructor: InstructorListItem;
  status: { color: string; label: string };
}

export const CardContext = createContext<CardCtx | null>(null);

export function useCard() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("Card sub-components must be used inside <InstructorSpotlight.Card>");
  return ctx;
}
