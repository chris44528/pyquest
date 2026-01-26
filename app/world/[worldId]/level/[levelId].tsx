import { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { usePython } from '@/components/code/PythonRunner';
import { useLevel } from '@/hooks/useLevel';
import { useExercise } from '@/hooks/useExercise';
import { useProgressStore } from '@/stores/progressStore';
import { LessonContent } from '@/components/lesson/LessonContent';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { CodeEditor } from '@/components/code/CodeEditor';
import { Console } from '@/components/code/Console';
import { runTests, type RunCodeFn } from '@/lib/testRunner';
import type { StarRating } from '@/types/progression';
import type { ConsoleEntry } from '@/types/python';
import Colors from '@/constants/Colors';

type LevelPhase = 'lesson' | 'exercises' | 'challenge' | 'complete';

function calculateStars(
  exerciseResults: { firstTry: boolean; hintsUsed: number }[],
): StarRating {
  if (exerciseResults.length === 0) return 1;
  const perfectCount = exerciseResults.filter(
    (r) => r.firstTry && r.hintsUsed === 0,
  ).length;
  const ratio = perfectCount / exerciseResults.length;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

export default function LevelScreen() {
  const { worldId, levelId } = useLocalSearchParams<{
    worldId: string;
    levelId: string;
  }>();
  const router = useRouter();
  const { runCode, isReady } = usePython();

  const { level, isLoading, error } = useLevel(worldId ?? '', levelId ?? '');

  const initLevelProgress = useProgressStore((s) => s.initLevelProgress);
  const completeExercise = useProgressStore((s) => s.completeExercise);
  const completeLevel = useProgressStore((s) => s.completeLevel);
  const updateStreak = useProgressStore((s) => s.updateStreak);
  const totalXP = useProgressStore((s) => s.totalXP);

  const [phase, setPhase] = useState<LevelPhase>('lesson');
  const [xpBefore, setXpBefore] = useState(0);

  // Challenge state
  const [challengeEntries, setChallengeEntries] = useState<ConsoleEntry[]>([]);
  const [challengeRunning, setChallengeRunning] = useState(false);
  const [challengePassed, setChallengePassed] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [bonusPassed, setBonusPassed] = useState<boolean[]>([]);

  // Stars for completion screen
  const [earnedStars, setEarnedStars] = useState<StarRating>(1);

  const exercises = level?.exercises ?? [];
  const exerciseHook = useExercise(exercises);

  // Initialize level progress when level loads
  useMemo(() => {
    if (level) {
      initLevelProgress(
        level.id,
        level.exercises.map((e) => e.id),
      );
      setChallengeCode(level.challenge.starterCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?.id]);

  const handleExerciseComplete = useCallback(
    (exerciseId: string, attempts: number, hintsUsed: number) => {
      completeExercise(levelId ?? '', exerciseId, hintsUsed, attempts);
      exerciseHook.markComplete(exerciseId, attempts, hintsUsed);
    },
    [completeExercise, levelId, exerciseHook],
  );

  const handleValidateCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!exerciseHook.currentExercise) return false;
      const result = await runTests(
        code,
        exerciseHook.currentExercise.testCases,
        runCode as RunCodeFn,
      );
      return result.allPassed;
    },
    [exerciseHook.currentExercise, runCode],
  );

  const goToExercises = () => {
    setXpBefore(totalXP);
    setPhase('exercises');
  };

  const goToChallenge = () => {
    setPhase('challenge');
  };

  const handleChallengeRun = async (code: string) => {
    if (!isReady || challengeRunning) return;
    setChallengeRunning(true);
    setChallengeEntries([{ type: 'system', text: 'Running...' }]);

    const result = await runCode(code);
    const entries: ConsoleEntry[] = [];
    if (result.success) {
      entries.push({
        type: 'stdout',
        text: result.stdout || '(no output)',
      });
    } else {
      entries.push({
        type: 'stderr',
        text: result.error || result.stderr || 'Execution failed',
      });
    }
    setChallengeEntries(entries);
    setChallengeRunning(false);
  };

  const handleChallengeSubmit = async () => {
    if (!level || challengeRunning) return;
    setChallengeRunning(true);
    setChallengeEntries([{ type: 'system', text: 'Checking...' }]);

    const result = await runTests(
      challengeCode,
      level.challenge.testCases,
      runCode as RunCodeFn,
    );

    if (result.allPassed) {
      // Check bonus objectives
      const bonusResults: boolean[] = [];
      if (level.challenge.bonusObjectives) {
        for (const bonus of level.challenge.bonusObjectives) {
          const bonusResult = await runTests(
            challengeCode,
            [bonus.testCase],
            runCode as RunCodeFn,
          );
          bonusResults.push(bonusResult.allPassed);
        }
      }
      setBonusPassed(bonusResults);

      setChallengeEntries([
        { type: 'result', text: 'All tests passed! Challenge complete!' },
      ]);
      setChallengePassed(true);
    } else {
      const failedVisible = result.visibleResults.filter((r) => !r.passed);
      const entries: ConsoleEntry[] = [
        { type: 'stderr', text: 'Some tests failed:' },
      ];
      for (const r of failedVisible) {
        entries.push({
          type: 'stderr',
          text: `Expected: ${r.expected}\nGot: ${r.actual}`,
        });
      }
      setChallengeEntries(entries);
    }
    setChallengeRunning(false);
  };

  const handleComplete = () => {
    const stars = calculateStars(exerciseHook.exerciseResults);
    setEarnedStars(stars);
    completeLevel(levelId ?? '', stars);
    updateStreak();
    setPhase('complete');
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading level...</Text>
        </View>
      </>
    );
  }

  // Error state
  if (error || !level) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>{'\u274C'}</Text>
          <Text style={styles.errorText}>{error || 'Level not found'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: level.title,
          headerShown: true,
        }}
      />

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width:
                phase === 'lesson'
                  ? '10%'
                  : phase === 'exercises'
                    ? `${10 + (exerciseHook.completedCount / exerciseHook.totalExercises) * 70}%`
                    : phase === 'challenge'
                      ? '85%'
                      : '100%',
            },
          ]}
        />
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, phase === 'lesson' && styles.progressLabelActive]}>
            Lesson
          </Text>
          <Text style={[styles.progressLabel, phase === 'exercises' && styles.progressLabelActive]}>
            Exercises {exerciseHook.completedCount}/{exerciseHook.totalExercises}
          </Text>
          <Text style={[styles.progressLabel, phase === 'challenge' && styles.progressLabelActive]}>
            Challenge
          </Text>
        </View>
      </View>

      {/* Phase: Lesson */}
      {phase === 'lesson' && (
        <View style={styles.phaseContainer}>
          <LessonContent content={level.content} onCodeRun={handleChallengeRun} />
          <View style={styles.bottomAction}>
            <Pressable style={styles.primaryButton} onPress={goToExercises}>
              <Text style={styles.primaryButtonText}>
                Continue to Exercises {'\u2192'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Phase: Exercises */}
      {phase === 'exercises' && exerciseHook.currentExercise && (
        <ScrollView
          style={styles.phaseContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <ExerciseCard
            exercise={exerciseHook.currentExercise}
            exerciseNumber={exerciseHook.currentIndex + 1}
            totalExercises={exerciseHook.totalExercises}
            onComplete={handleExerciseComplete}
            runCode={runCode}
            validateCode={handleValidateCode}
          />

          {exerciseHook.isAllComplete ? (
            <Pressable style={styles.primaryButton} onPress={goToChallenge}>
              <Text style={styles.primaryButtonText}>
                Continue to Challenge {'\u2192'}
              </Text>
            </Pressable>
          ) : (
            exerciseHook.completedCount > exerciseHook.currentIndex && (
              <Pressable
                style={styles.secondaryButton}
                onPress={exerciseHook.nextExercise}
              >
                <Text style={styles.secondaryButtonText}>
                  Next Exercise {'\u2192'}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>
      )}

      {/* Phase: Challenge */}
      {phase === 'challenge' && (
        <ScrollView
          style={styles.phaseContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeIcon}>{'\U0001F3AF'}</Text>
            <Text style={styles.challengeTitle}>{level.challenge.title}</Text>
          </View>
          <Text style={styles.challengeDescription}>
            {level.challenge.description}
          </Text>

          <View style={styles.requirementsList}>
            <Text style={styles.requirementsTitle}>Requirements:</Text>
            {level.challenge.requirements.map((req, i) => (
              <View key={i} style={styles.requirementItem}>
                <Text style={styles.requirementBullet}>{'\u25CB'}</Text>
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>

          {level.challenge.bonusObjectives &&
            level.challenge.bonusObjectives.length > 0 && (
              <View style={styles.bonusList}>
                <Text style={styles.bonusTitle}>{'\u2B50'} Bonus:</Text>
                {level.challenge.bonusObjectives.map((bonus, i) => (
                  <View key={i} style={styles.bonusItem}>
                    <Text style={styles.bonusBullet}>
                      {bonusPassed[i] ? '\u2705' : '\u2606'}
                    </Text>
                    <Text style={styles.bonusText}>
                      {bonus.description} (+{bonus.bonusXP} XP)
                    </Text>
                  </View>
                ))}
              </View>
            )}

          <CodeEditor
            initialCode={level.challenge.starterCode}
            onCodeChange={setChallengeCode}
            onRun={handleChallengeRun}
            showRunButton={isReady}
            showLineNumbers
            minHeight={140}
          />

          <Console
            entries={challengeEntries}
            isRunning={challengeRunning}
            maxHeight={150}
          />

          {challengePassed ? (
            <Pressable style={styles.primaryButton} onPress={handleComplete}>
              <Text style={styles.primaryButtonText}>
                Complete Level {'\u2192'}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.primaryButton,
                challengeRunning && styles.buttonDisabled,
              ]}
              onPress={handleChallengeSubmit}
              disabled={challengeRunning}
            >
              <Text style={styles.primaryButtonText}>Submit Challenge</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Phase: Complete */}
      {phase === 'complete' && (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>{'\U0001F389'}</Text>
          <Text style={styles.completeTitle}>Level Complete!</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((star) => (
              <Text
                key={star}
                style={[
                  styles.star,
                  star <= earnedStars ? styles.starEarned : styles.starEmpty,
                ]}
              >
                {'\u2B50'}
              </Text>
            ))}
          </View>

          <View style={styles.xpBreakdown}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <Text style={styles.xpAmount}>+{totalXP - xpBefore} XP</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {exerciseHook.exerciseResults.filter((r) => r.firstTry).length}/
                {exerciseHook.totalExercises}
              </Text>
              <Text style={styles.statLabel}>First Try</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {exerciseHook.exerciseResults.reduce(
                  (sum, r) => sum + r.hintsUsed,
                  0,
                )}
              </Text>
              <Text style={styles.statLabel}>Hints Used</Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.dark.subtle,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  progressBarContainer: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  progressBarFill: {
    height: 3,
    backgroundColor: Colors.brand.primary,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.dark.subtle,
  },
  progressLabelActive: {
    color: Colors.brand.primaryLight,
    fontWeight: '700',
  },
  phaseContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bottomAction: {
    padding: 16,
    paddingBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  secondaryButtonText: {
    color: Colors.brand.primaryLight,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Challenge
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  challengeIcon: {
    fontSize: 24,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8f9fa',
  },
  challengeDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e5e7eb',
  },
  requirementsList: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8f9fa',
    marginBottom: 2,
  },
  requirementItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  requirementBullet: {
    fontSize: 14,
    color: Colors.brand.primaryLight,
    marginTop: 1,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#e5e7eb',
  },
  bonusList: {
    backgroundColor: Colors.brand.accent + '10',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.accent,
  },
  bonusItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bonusBullet: {
    fontSize: 14,
    marginTop: 1,
  },
  bonusText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#e5e7eb',
  },
  // Complete
  completeContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  completeEmoji: {
    fontSize: 56,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8f9fa',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 36,
  },
  starEarned: {
    opacity: 1,
  },
  starEmpty: {
    opacity: 0.3,
  },
  xpBreakdown: {
    backgroundColor: Colors.brand.xp + '20',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  xpTitle: {
    fontSize: 13,
    color: Colors.brand.xp,
    fontWeight: '600',
    marginBottom: 4,
  },
  xpAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.brand.xp,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8f9fa',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtle,
    marginTop: 4,
  },
});
