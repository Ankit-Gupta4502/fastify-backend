// ── Types ────────────────────────────────────────────────────────────────────

export type Goal = "stress" | "flexibility" | "strength" | "recovery" | "spiritual";
export type Frequency = "casual" | "regular" | "daily";
export type Need = "none" | "prenatal" | "injury";

export interface Answers {
  goal?: Goal;
  frequency?: Frequency;
  need?: Need;
}

export interface QuizState {
  step: 0 | 1 | 2 | 3;
  answers: Answers;
}

export type QuizAction =
  | { type: "START" }
  | { type: "ANSWER_GOAL"; value: Goal }
  | { type: "ANSWER_FREQUENCY"; value: Frequency }
  | { type: "ANSWER_NEED"; value: Need }
  | { type: "RESET" };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "START":       return { ...state, step: 1 };
    case "ANSWER_GOAL": return { step: 2, answers: { ...state.answers, goal: action.value } };
    case "ANSWER_FREQUENCY": return { step: 3, answers: { ...state.answers, frequency: action.value } };
    case "ANSWER_NEED": return { step: 3, answers: { ...state.answers, need: action.value } };
    case "RESET":       return { step: 0, answers: {} };
    default:            return state;
  }
}

// ── Recommendation types ──────────────────────────────────────────────────────

export type PlanSlug = "private" | "prenatal_postnatal" | "therapeutic_yoga";

export interface Recommendation {
  slug: PlanSlug;
  emoji: string;
  title: string;
  tagline: string;
  why: string;
  gradient: string;
  href: string;
}
