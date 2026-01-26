import { useState, useCallback } from 'react';
import type { Exercise } from '@/types/content';
import { runTests, type RunCodeFn, type TestRunResult } from '@/lib/testRunner';

interface ExerciseResult {
  exerciseId: string;
  attempts: number;
  hintsUsed: number;
  firstTry: boolean;
}

interface UseExerciseResult {
  currentIndex: number;
  currentExercise: Exercise | null;
  totalExercises: number;
  completedCount: number;
  isAllComplete: boolean;
  exerciseResults: ExerciseResult[];
  submitAnswer: (code: string, runCodeFn: RunCodeFn) => Promise<boolean>;
  markComplete: (exerciseId: string, attempts: number, hintsUsed: number) => void;
  nextExercise: () => void;
}

export function useExercise(exercises: Exercise[]): UseExerciseResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const currentExercise = exercises[currentIndex] ?? null;
  const completedCount = results.length;
  const isAllComplete = results.length >= exercises.length;

  const markComplete = useCallback(
    (exerciseId: string, attempts: number, hintsUsed: number) => {
      setResults((prev) => {
        if (prev.some((r) => r.exerciseId === exerciseId)) return prev;
        return [
          ...prev,
          { exerciseId, attempts, hintsUsed, firstTry: attempts === 1 },
        ];
      });
    },
    [],
  );

  const submitAnswer = useCallback(
    async (code: string, runCodeFn: RunCodeFn): Promise<boolean> => {
      if (!currentExercise) return false;

      // For types that use test runner
      if (
        currentExercise.type === 'fill_blank' ||
        currentExercise.type === 'fix_bug' ||
        currentExercise.type === 'write_code'
      ) {
        if (currentExercise.testCases.length === 0) return false;

        const result: TestRunResult = await runTests(
          code,
          currentExercise.testCases,
          runCodeFn,
        );
        return result.allPassed;
      }

      // For predict_output and multiple_choice — string comparison
      return code.trim() === currentExercise.solution.trim();
    },
    [currentExercise],
  );

  const nextExercise = useCallback(() => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, exercises.length]);

  return {
    currentIndex,
    currentExercise,
    totalExercises: exercises.length,
    completedCount,
    isAllComplete,
    exerciseResults: results,
    submitAnswer,
    markComplete,
    nextExercise,
  };
}
