import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { usePython } from '@/components/code/PythonRunner';
import { useLevel } from '@/hooks/useLevel';
import { useExercise } from '@/hooks/useExercise';
import { useProgressStore } from '@/stores/progressStore';
import { useAchievements } from '@/hooks/useAchievements';
import { PaginatedLesson } from '@/components/lesson/PaginatedLesson';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { CodeEditor } from '@/components/code/CodeEditor';
import { Console } from '@/components/code/Console';
import { StarRating } from '@/components/gamification/StarRating';
import { XPCounter } from '@/components/gamification/XPCounter';
import { XPBreakdownCard } from '@/components/gamification/XPBreakdownCard';
import { ConfettiEffect } from '@/components/gamification/ConfettiEffect';
import { ComboBadge } from '@/components/gamification/ComboBadge';
import { runTests, type RunCodeFn } from '@/lib/testRunner';
import { calculateLevelXP, type XPBreakdown } from '@/lib/xpCalculator';
import { triggerHaptic, tapHaptic } from '@/lib/haptics';
import { playSound } from '@/lib/sounds';
import { getLevelIds } from '@/lib/contentLoader';
import type { StarRating as StarRatingType } from '@/types/progression';
import type { Achievement } from '@/types/progression';
import type { ConsoleEntry } from '@/types/python';
import Colors from '@/constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

type LevelPhase = 'lesson' | 'exercises' | 'challenge' | 'complete';

function ProgressBar({
  phase,
  completedCount,
  totalExercises,
}: {
  phase: LevelPhase;
  completedCount: number;
  totalExercises: number;
}) {
  const progressWidth = useSharedValue(10);

  useEffect(() => {
    let target = 10;
    if (phase === 'exercises') {
      target = 10 + (totalExercises > 0 ? (completedCount / totalExercises) * 70 : 0);
    } else if (phase === 'challenge') {
      target = 85;
    } else if (phase === 'complete') {
      target = 100;
    }
    progressWidth.value = withTiming(target, { duration: 400 });
  }, [phase, completedCount, totalExercises]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBarFill, fillStyle]} />
      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, phase === 'lesson' && styles.progressLabelActive]}>
          Lesson
        </Text>
        <Text style={[styles.progressLabel, phase === 'exercises' && styles.progressLabelActive]}>
          Exercises {completedCount}/{totalExercises}
        </Text>
        <Text style={[styles.progressLabel, phase === 'challenge' && styles.progressLabelActive]}>
          Challenge
        </Text>
      </View>
    </View>
  );
}

function PhaseAnnouncement({
  text,
  visible,
  onDone,
}: {
  text: string;
  visible: boolean;
  onDone: () => void;
}) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12 }),
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(300, withTiming(0, { duration: 200 })),
      );

      const timer = setTimeout(onDone, 650);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.announcementOverlay}>
      <Animated.View style={[styles.announcementBadge, animStyle]}>
        <Text style={styles.announcementText}>{text}</Text>
      </Animated.View>
    </View>
  );
}

function calculateStars(
  exerciseResults: { firstTry: boolean; hintsUsed: number }[],
): StarRatingType {
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
  const { checkAfterLevel } = useAchievements();

  const initLevelProgress = useProgressStore((s) => s.initLevelProgress);
  const completeExercise = useProgressStore((s) => s.completeExercise);
  const completeLevel = useProgressStore((s) => s.completeLevel);
  const updateStreak = useProgressStore((s) => s.updateStreak);
  const saveBestTime = useProgressStore((s) => s.saveBestTime);
  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);
  const [phase, setPhase] = useState<LevelPhase>('lesson');
  const [xpBefore, setXpBefore] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState(0);

  // Phase transition state
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [pendingPhase, setPendingPhase] = useState<LevelPhase | null>(null);

  // Phase content animation
  const phaseOpacity = useSharedValue(1);
  const phaseTranslateX = useSharedValue(0);

  // Exercise transition animation
  const exerciseOpacity = useSharedValue(1);
  const exerciseTranslateX = useSharedValue(0);

  // Challenge state
  const [challengeEntries, setChallengeEntries] = useState<ConsoleEntry[]>([]);
  const [challengeRunning, setChallengeRunning] = useState(false);
  const [challengePassed, setChallengePassed] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [bonusPassed, setBonusPassed] = useState<boolean[]>([]);

  // Complete phase state
  const [earnedStars, setEarnedStars] = useState<StarRatingType>(1);
  const [xpBreakdownData, setXpBreakdownData] = useState<XPBreakdown | null>(null);
  const [isWorldComplete, setIsWorldComplete] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

  const exercises = level?.exercises ?? [];
  const exerciseHook = useExercise(exercises);

  // Initialize level progress when level loads
  useEffect(() => {
    if (level) {
      initLevelProgress(
        level.id,
        level.exercises.map((e) => e.id),
      );
      setChallengeCode(level.challenge.starterCode);
    }
  }, [level?.id, initLevelProgress]);

  const animatePhaseTransition = useCallback(
    (targetPhase: LevelPhase, announcement?: string) => {
      if (announcement) {
        tapHaptic();
        setAnnouncementText(announcement);
        setShowAnnouncement(true);
        setPendingPhase(targetPhase);
      } else {
        phaseOpacity.value = withTiming(0, { duration: 150 });
        phaseTranslateX.value = withTiming(-30, { duration: 150 });

        setTimeout(() => {
          setPhase(targetPhase);
          phaseTranslateX.value = 30;
          phaseOpacity.value = withTiming(1, { duration: 200 });
          phaseTranslateX.value = withTiming(0, { duration: 200 });
        }, 160);
      }
    },
    [],
  );

  const handleAnnouncementDone = useCallback(() => {
    setShowAnnouncement(false);
    if (pendingPhase) {
      setPhase(pendingPhase);
      setPendingPhase(null);
      phaseOpacity.value = 0;
      phaseTranslateX.value = 30;
      phaseOpacity.value = withTiming(1, { duration: 250 });
      phaseTranslateX.value = withTiming(0, { duration: 250 });
    }
  }, [pendingPhase]);

  const phaseContentStyle = useAnimatedStyle(() => ({
    opacity: phaseOpacity.value,
    transform: [{ translateX: phaseTranslateX.value }],
  }));

  const exerciseContentStyle = useAnimatedStyle(() => ({
    opacity: exerciseOpacity.value,
    transform: [{ translateX: exerciseTranslateX.value }],
  }));

  const handleExerciseComplete = useCallback(
    (exerciseId: string, attempts: number, hintsUsed: number) => {
      const nextCombo = (attempts === 1 && hintsUsed === 0) ? exerciseHook.combo + 1 : 0;
      const comboMultiplier = nextCombo > 1 ? nextCombo : undefined;
      completeExercise(levelId ?? '', exerciseId, hintsUsed, attempts, undefined, comboMultiplier);
      exerciseHook.markComplete(exerciseId, attempts, hintsUsed);
    },
    [completeExercise, levelId, exerciseHook.markComplete, exerciseHook.combo],
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

  const handleNextExercise = useCallback(() => {
    exerciseOpacity.value = withTiming(0, { duration: 150 });
    exerciseTranslateX.value = withTiming(-SCREEN_WIDTH * 0.3, { duration: 150 });

    setTimeout(() => {
      exerciseHook.nextExercise();
      exerciseTranslateX.value = SCREEN_WIDTH * 0.3;
      exerciseOpacity.value = withTiming(1, { duration: 200 });
      exerciseTranslateX.value = withTiming(0, { duration: 200 });
    }, 160);
  }, [exerciseHook.nextExercise]);

  const goToExercises = () => {
    setXpBefore(totalXP);
    setExerciseStartTime(Date.now());
    animatePhaseTransition('exercises', 'Exercises');
  };

  const goToChallenge = () => {
    animatePhaseTransition('challenge', 'Challenge');
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

    // Calculate elapsed time
    const elapsed = exerciseStartTime > 0
      ? Math.round((Date.now() - exerciseStartTime) / 1000)
      : 0;

    // Calculate XP breakdown
    const isBoss = level?.id === 'level10'; // Boss level
    const bonusCount = bonusPassed.filter(Boolean).length;
    const breakdown = calculateLevelXP({
      stars,
      isBoss,
      bonusObjectivesPassed: bonusCount,
      exerciseResults: exerciseHook.exerciseResults.map((r) => ({
        hintsUsed: r.hintsUsed,
        attempts: r.attempts,
      })),
      streakDays: streak.current,
    });
    setXpBreakdownData(breakdown);

    // Complete level in store
    completeLevel(levelId ?? '', stars);
    updateStreak();
    if (elapsed > 0) {
      saveBestTime(levelId ?? '', elapsed);
    }

    // Fire haptics
    triggerHaptic('success');
    playSound('levelComplete');

    // Check world completion
    const wId = worldId ?? '';
    const allLevelIds = getLevelIds(wId);
    const updatedProgress = useProgressStore.getState().levelProgress;
    const allComplete = allLevelIds.every(
      (id) => updatedProgress[id]?.status === 'completed',
    );
    setIsWorldComplete(allComplete);

    // Check achievements
    const newAchievements = checkAfterLevel(
      levelId ?? '',
      stars,
      elapsed,
      exerciseHook.exerciseResults.map((r) => ({
        hintsUsed: r.hintsUsed,
        attempts: r.attempts,
      })),
    );
    setUnlockedAchievements(newAchievements);

    setPhase('complete');
  };

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

      <ProgressBar
        phase={phase}
        completedCount={exerciseHook.completedCount}
        totalExercises={exerciseHook.totalExercises}
      />

      <PhaseAnnouncement
        text={announcementText}
        visible={showAnnouncement}
        onDone={handleAnnouncementDone}
      />

      {/* Phase: Lesson */}
      {phase === 'lesson' && (
        <PaginatedLesson
          content={level.content}
          onCodeRun={runCode}
          onComplete={goToExercises}
        />
      )}

      {/* Phase: Exercises */}
      {phase === 'exercises' && exerciseHook.currentExercise && (
        <Animated.View style={[{ flex: 1 }, phaseContentStyle]}>
          <ScrollView
            style={styles.phaseContainer}
            contentContainerStyle={styles.scrollContent}
          >
            <ComboBadge combo={exerciseHook.combo} />

            <Animated.View style={exerciseContentStyle}>
              <ExerciseCard
                exercise={exerciseHook.currentExercise}
                exerciseNumber={exerciseHook.currentIndex + 1}
                totalExercises={exerciseHook.totalExercises}
                onComplete={handleExerciseComplete}
                runCode={runCode}
                validateCode={handleValidateCode}
              />
            </Animated.View>

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
                  onPress={handleNextExercise}
                >
                  <Text style={styles.secondaryButtonText}>
                    Next Exercise {'\u2192'}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Phase: Challenge */}
      {phase === 'challenge' && (
        <Animated.View style={[{ flex: 1 }, phaseContentStyle]}>
          <ScrollView
            style={styles.phaseContainer}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeIcon}>{'\uD83C\uDFAF'}</Text>
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
        </Animated.View>
      )}

      {/* Phase: Complete */}
      {phase === 'complete' && (
        <ScrollView
          contentContainerStyle={styles.completeContainer}
        >
          {earnedStars === 3 && <ConfettiEffect />}

          <Text style={styles.completeEmoji}>
            {isWorldComplete ? '\uD83C\uDF0D' : '\uD83C\uDF89'}
          </Text>
          <Text style={styles.completeTitle}>
            {isWorldComplete ? 'World Complete!' : 'Level Complete!'}
          </Text>

          <StarRating stars={earnedStars} animated size="large" />

          <XPCounter
            value={totalXP}
            gained={xpBreakdownData?.total ?? (totalXP - xpBefore)}
            size="large"
          />

          {xpBreakdownData && <XPBreakdownCard breakdown={xpBreakdownData} />}

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

          {unlockedAchievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.achievementsTitle}>Achievements Unlocked!</Text>
              {unlockedAchievements.map((a) => (
                <View key={a.id} style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>{a.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>{a.name}</Text>
                    <Text style={styles.achievementDesc}>{a.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace(`/world/${worldId}`)}
          >
            <Text style={styles.primaryButtonText}>Back to Levels</Text>
          </Pressable>
        </ScrollView>
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
  announcementOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  announcementBadge: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  announcementText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
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
  completeContainer: {
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  completeEmoji: {
    fontSize: 56,
    marginTop: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8f9fa',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
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
  achievementsSection: {
    width: '100%',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.brand.accent + '30',
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brand.accent,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8f9fa',
  },
  achievementDesc: {
    fontSize: 12,
    color: Colors.dark.subtle,
    marginTop: 2,
  },
});
