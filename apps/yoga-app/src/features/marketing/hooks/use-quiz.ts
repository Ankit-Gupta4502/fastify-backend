import { useReducer, useTransition, useMemo, useCallback } from "react";
import { quizReducer, type Goal, type Frequency, type Need, type QuizState, type Recommendation } from "@/features/marketing/constants/quiz-types";
import { computeRecommendation } from "@/features/marketing/constants/quiz-data";

export interface UseQuizReturn {
  state: QuizState;
  isPending: boolean;
  recommendation: Recommendation | null;
  isDone: boolean;
  handleGoal: (value: Goal) => void;
  handleFrequency: (value: Frequency) => void;
  handleNeed: (value: Need) => void;
  handleReset: () => void;
  handleStart: () => void;
}

export function useQuiz(): UseQuizReturn {
  const [state, dispatch] = useReducer(quizReducer, { step: 0, answers: {} });
  const [isPending, startTransition] = useTransition();

  const recommendation = useMemo(
    () =>
      state.answers.goal && state.answers.frequency && state.answers.need
        ? computeRecommendation(state.answers)
        : null,
    [state.answers],
  );

  const isDone = recommendation !== null;

  const handleGoal      = useCallback((value: Goal)      => startTransition(() => dispatch({ type: "ANSWER_GOAL",      value })), []);
  const handleFrequency = useCallback((value: Frequency)  => startTransition(() => dispatch({ type: "ANSWER_FREQUENCY", value })), []);
  const handleNeed      = useCallback((value: Need)       => startTransition(() => dispatch({ type: "ANSWER_NEED",      value })), []);
  const handleReset     = useCallback(() => startTransition(() => dispatch({ type: "RESET" })), []);
  const handleStart     = useCallback(() => startTransition(() => dispatch({ type: "START" })), []);

  return {
    state,
    isPending,
    recommendation,
    isDone,
    handleGoal,
    handleFrequency,
    handleNeed,
    handleReset,
    handleStart,
  };
}
