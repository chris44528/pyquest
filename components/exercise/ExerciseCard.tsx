import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import type { Exercise } from '@/types/content';
import { FillBlank } from './FillBlank';
import { FixBug } from './FixBug';
import { PredictOutput } from './PredictOutput';
import { WriteCode } from './WriteCode';
import { MultipleChoice } from './MultipleChoice';
import { CodeBlock } from '@/components/lesson/CodeBlock';
import { XPFloater } from '@/components/gamification/XPFloater';
import { successHaptic, errorHaptic } from '@/lib/haptics';
import { playSound } from '@/lib/sounds';
import Colors from '@/constants/Colors';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  onComplete: (exerciseId: string, attempts: number, hintsUsed: number) => void;
  runCode?: (code: string) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
  validateCode?: (code: string) => Promise<boolean>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#34d399',
  medium: '#fbbf24',
  hard: '#f87171',
};

export function ExerciseCard({
  exercise,
  exerciseNumber,
  totalExercises,
  onComplete,
  runCode,
  validateCode,
}: ExerciseCardProps) {
  const [attempts, setAttempts] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [showXPFloat, setShowXPFloat] = useState(false);

  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: successScale.value },
    ],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const handleSubmit = useCallback(
    async (answer: string) => {
      if (isCorrect || isChecking) return;
      setIsChecking(true);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      let passed = false;

      if (
        exercise.type === 'predict_output' ||
        exercise.type === 'multiple_choice'
      ) {
        passed = answer.trim() === exercise.solution.trim();
      } else if (validateCode) {
        passed = await validateCode(answer);
      }

      if (passed) {
        setIsCorrect(true);
        setFeedback('Correct!');
        setShowXPFloat(true);
        successScale.value = withSequence(
          withSpring(1.03, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12, stiffness: 150 }),
        );
        successHaptic();
        playSound('xpGain');
        onComplete(exercise.id, newAttempts, hintsRevealed);
      } else {
        const remaining = 3 - newAttempts;
        if (newAttempts >= 3) {
          setFeedback("Not quite. You can view the solution below.");
        } else if (remaining > 0) {
          setFeedback(`Not quite — try again! (${remaining} attempt${remaining === 1 ? '' : 's'} before solution)`);
        } else {
          setFeedback("Not quite — try again!");
        }
        // Auto-reveal first hint on first wrong answer
        if (newAttempts === 1 && hintsRevealed === 0 && exercise.hints.length > 0) {
          setHintsRevealed(1);
        }
        errorHaptic();
        playSound('xpGain');
        triggerShake();
      }
      setIsChecking(false);
    },
    [attempts, exercise, hintsRevealed, isCorrect, isChecking, onComplete, validateCode],
  );

  const revealHint = () => {
    if (hintsRevealed < exercise.hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  const renderExerciseComponent = () => {
    const disabled = isCorrect || isChecking;
    switch (exercise.type) {
      case 'predict_output':
        return (
          <PredictOutput
            exercise={exercise}
            onSubmit={handleSubmit}
            disabled={disabled}
          />
        );
      case 'fill_blank':
        return (
          <FillBlank
            exercise={exercise}
            onSubmit={handleSubmit}
            disabled={disabled}
          />
        );
      case 'fix_bug':
        return (
          <FixBug
            exercise={exercise}
            onSubmit={handleSubmit}
            disabled={disabled}
          />
        );
      case 'write_code':
        return (
          <WriteCode
            exercise={exercise}
            onSubmit={handleSubmit}
            disabled={disabled}
            runCode={runCode}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoice
            exercise={exercise}
            onSubmit={handleSubmit}
            disabled={disabled}
          />
        );
      default:
        return <Text style={styles.errorText}>Unknown exercise type</Text>;
    }
  };

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <XPFloater amount={15} visible={showXPFloat} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            {exerciseNumber}/{totalExercises}
          </Text>
        </View>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: (DIFFICULTY_COLORS[exercise.difficulty] || '#9ca3af') + '20' },
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: DIFFICULTY_COLORS[exercise.difficulty] || '#9ca3af' },
            ]}
          >
            {exercise.difficulty}
          </Text>
        </View>
      </View>

      {/* Prompt */}
      <Text style={styles.prompt}>{exercise.prompt}</Text>

      {/* Exercise component */}
      {renderExerciseComponent()}

      {/* Feedback */}
      {feedback && (
        <View
          style={[
            styles.feedbackContainer,
            isCorrect ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          <Text style={styles.feedbackIcon}>
            {isCorrect ? '\u2705' : '\u274C'}
          </Text>
          <Text
            style={[
              styles.feedbackText,
              { color: isCorrect ? '#34d399' : '#f87171' },
            ]}
          >
            {feedback}
          </Text>
        </View>
      )}

      {/* Explanation help after first wrong answer */}
      {!isCorrect && attempts >= 1 && !showSolution && (
        <View style={styles.helpSection}>
          <Text style={styles.helpLabel}>{'\U0001F4D6'} Reminder</Text>
          <Text style={styles.helpText}>{exercise.explanation}</Text>
        </View>
      )}

      {/* Hints */}
      {!isCorrect && !showSolution && (
        <View style={styles.hintSection}>
          {hintsRevealed > 0 && (
            <View style={styles.revealedHints}>
              {exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
                <View key={i} style={styles.hintItem}>
                  <Text style={styles.hintLabel}>Hint {i + 1}:</Text>
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>
          )}
          {hintsRevealed < exercise.hints.length && (
            <Pressable style={styles.hintButton} onPress={revealHint}>
              <Text style={styles.hintButtonText}>
                {'\U0001F4A1'} Show Hint ({hintsRevealed}/{exercise.hints.length})
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Solution (after 3 failed attempts) */}
      {!isCorrect && attempts >= 3 && !showSolution && (
        <Pressable
          style={styles.solutionToggle}
          onPress={() => setShowSolution(true)}
        >
          <Text style={styles.solutionToggleText}>Show Solution</Text>
        </Pressable>
      )}

      {showSolution && (
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionLabel}>Solution</Text>
          <CodeBlock code={exercise.solution} />
          <Text style={styles.explanationText}>{exercise.explanation}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: Colors.brand.primary + '30',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  numberText: {
    color: Colors.brand.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  difficultyBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  prompt: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f8f9fa',
    fontWeight: '600',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  feedbackSuccess: {
    backgroundColor: '#34d39915',
  },
  feedbackError: {
    backgroundColor: '#f8717115',
  },
  feedbackIcon: {
    fontSize: 16,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  hintSection: {
    gap: 8,
  },
  revealedHints: {
    gap: 8,
  },
  hintItem: {
    backgroundColor: Colors.brand.accent + '10',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand.accent,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.accent,
    marginBottom: 2,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#e5e7eb',
  },
  hintButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.brand.accent + '15',
  },
  hintButtonText: {
    fontSize: 13,
    color: Colors.brand.accent,
    fontWeight: '600',
  },
  solutionToggle: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  solutionToggleText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  solutionContainer: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  solutionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.accent,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#e5e7eb',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
  },
  helpSection: {
    backgroundColor: Colors.brand.primary + '12',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand.primaryLight,
  },
  helpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.primaryLight,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#d1d5db',
  },
});
