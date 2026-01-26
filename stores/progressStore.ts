import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProgress,
  StreakData,
  LevelProgress,
  ExerciseProgress,
  Achievement,
  StarRating,
} from '@/types/progression';
import { XP_REWARDS } from '@/types/progression';

interface ProgressActions {
  updateXP: (amount: number) => void;
  completeExercise: (levelId: string, exerciseId: string, hintsUsed: number, attempts: number, lastSubmission?: string) => void;
  completeLevel: (levelId: string, stars: StarRating) => void;
  updateStreak: () => void;
  unlockAchievement: (achievement: Achievement) => void;
  initLevelProgress: (levelId: string, exerciseIds: string[]) => void;
  saveBestTime: (levelId: string, timeSeconds: number) => void;
  resetProgress: () => void;
}

type ProgressStore = UserProgress & ProgressActions;

const initialState: UserProgress = {
  totalXP: 0,
  currentWorld: 1,
  currentLevel: 1,
  streak: {
    current: 0,
    longest: 0,
    lastActivityDate: '',
  },
  levelProgress: {},
  achievements: [],
};

function calculateStreakUpdate(streak: StreakData): StreakData {
  const today = new Date().toISOString().split('T')[0];

  if (!streak.lastActivityDate) {
    return { current: 1, longest: 1, lastActivityDate: today };
  }

  if (streak.lastActivityDate === today) {
    return streak;
  }

  const lastDate = new Date(streak.lastActivityDate);
  const todayDate = new Date(today);
  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const newCurrent = streak.current + 1;
    return {
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest),
      lastActivityDate: today,
    };
  }

  return {
    ...streak,
    current: 1,
    lastActivityDate: today,
  };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateXP: (amount: number) =>
        set((state) => ({
          totalXP: state.totalXP + amount,
        })),

      completeExercise: (
        levelId: string,
        exerciseId: string,
        hintsUsed: number,
        attempts: number,
        lastSubmission?: string
      ) =>
        set((state) => {
          const levelProg = state.levelProgress[levelId];
          if (!levelProg) return state;

          const updatedExercises = levelProg.exerciseProgress.map(
            (ep: ExerciseProgress) =>
              ep.exerciseId === exerciseId
                ? { ...ep, completed: true, attempts, hintsUsed, lastSubmission }
                : ep
          );

          let xpGain = XP_REWARDS.exerciseComplete;
          if (hintsUsed === 0) xpGain = XP_REWARDS.exerciseCompleteNoHints;
          if (attempts === 1 && hintsUsed === 0) xpGain = XP_REWARDS.exerciseCompleteFirstTry;

          return {
            totalXP: state.totalXP + xpGain,
            levelProgress: {
              ...state.levelProgress,
              [levelId]: {
                ...levelProg,
                status: 'in_progress' as const,
                exerciseProgress: updatedExercises,
              },
            },
          };
        }),

      completeLevel: (levelId: string, stars: StarRating) =>
        set((state) => {
          const levelProg = state.levelProgress[levelId];
          if (!levelProg) return state;

          let xpGain = XP_REWARDS.levelComplete;
          if (stars === 3) xpGain = XP_REWARDS.levelComplete3Stars;

          return {
            totalXP: state.totalXP + xpGain,
            levelProgress: {
              ...state.levelProgress,
              [levelId]: {
                ...levelProg,
                status: 'completed' as const,
                stars,
                completedAt: new Date().toISOString(),
              },
            },
          };
        }),

      updateStreak: () =>
        set((state) => ({
          streak: calculateStreakUpdate(state.streak),
        })),

      unlockAchievement: (achievement: Achievement) =>
        set((state) => {
          if (state.achievements.some((a) => a.id === achievement.id)) {
            return state;
          }
          return {
            totalXP: state.totalXP + XP_REWARDS.achievementUnlock,
            achievements: [...state.achievements, achievement],
          };
        }),

      initLevelProgress: (levelId: string, exerciseIds: string[]) =>
        set((state) => {
          if (state.levelProgress[levelId]) return state;

          const exerciseProgress: ExerciseProgress[] = exerciseIds.map((id) => ({
            exerciseId: id,
            completed: false,
            attempts: 0,
            hintsUsed: 0,
          }));

          const newLevelProgress: LevelProgress = {
            levelId,
            status: 'available',
            stars: 0,
            xpEarned: 0,
            attempts: 0,
            exerciseProgress,
          };

          return {
            levelProgress: {
              ...state.levelProgress,
              [levelId]: newLevelProgress,
            },
          };
        }),

      saveBestTime: (levelId: string, timeSeconds: number) =>
        set((state) => {
          const levelProg = state.levelProgress[levelId];
          if (!levelProg) return state;

          const currentBest = levelProg.bestTime;
          if (currentBest !== undefined && currentBest <= timeSeconds) return state;

          return {
            levelProgress: {
              ...state.levelProgress,
              [levelId]: {
                ...levelProg,
                bestTime: timeSeconds,
              },
            },
          };
        }),

      resetProgress: () => set(initialState),
    }),
    {
      name: 'pyquest-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
