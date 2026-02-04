import { useCallback } from 'react';
import { useProgressStore } from '@/stores/progressStore';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import type { Achievement } from '@/types/progression';
import type { AchievementDefinition } from '@/types/achievements';
import achievementDefinitions from '@/content/achievements.json';

const definitions = achievementDefinitions as AchievementDefinition[];

function getCompletedExerciseCount(
  levelProgress: Record<string, { exerciseProgress: { completed: boolean }[] }>,
): number {
  let count = 0;
  for (const lp of Object.values(levelProgress)) {
    count += lp.exerciseProgress.filter((ep) => ep.completed).length;
  }
  return count;
}

function getCompletedLevelCount(
  levelProgress: Record<string, { status: string }>,
): number {
  return Object.values(levelProgress).filter((lp) => lp.status === 'completed').length;
}

function getThreeStarLevelCount(
  levelProgress: Record<string, { status: string; stars: number }>,
): number {
  return Object.values(levelProgress).filter(
    (lp) => lp.status === 'completed' && lp.stars === 3,
  ).length;
}

function isWorldComplete(
  levelProgress: Record<string, { status: string }>,
  worldLevelIds: string[],
): boolean {
  return worldLevelIds.every((id) => levelProgress[id]?.status === 'completed');
}

function getCompletedWorldCount(
  levelProgress: Record<string, { status: string }>,
): number {
  // World 1 has levels level1-level10
  const world1Ids = Array.from({ length: 10 }, (_, i) => `level${i + 1}`);
  let count = 0;
  if (isWorldComplete(levelProgress, world1Ids)) count++;
  // Future worlds can be added here
  return count;
}

export function useAchievements() {
  const progressStore = useProgressStore;
  const notificationStore = useAchievementNotificationStore;

  const checkAndUnlock = useCallback(
    (context: {
      levelId?: string;
      stars?: number;
      timeSeconds?: number;
      exerciseResults?: { hintsUsed: number; attempts: number }[];
    }) => {
      const state = progressStore.getState();
      const unlocked = state.achievements;
      const unlockedIds = new Set(unlocked.map((a) => a.id));
      const newlyUnlocked: Achievement[] = [];

      for (const def of definitions) {
        if (unlockedIds.has(def.id)) continue;

        let conditionMet = false;

        switch (def.condition.type) {
          case 'exercise_count':
            conditionMet =
              getCompletedExerciseCount(state.levelProgress) >= def.condition.value;
            break;

          case 'level_count':
            conditionMet =
              getCompletedLevelCount(state.levelProgress) >= def.condition.value;
            break;

          case 'world_complete':
            conditionMet =
              getCompletedWorldCount(state.levelProgress) >= def.condition.value;
            break;

          case 'streak_days':
            conditionMet = state.streak.current >= def.condition.value;
            break;

          case 'total_xp':
            conditionMet = state.totalXP >= def.condition.value;
            break;

          case 'no_hints_level':
            if (context.exerciseResults) {
              const noHints = context.exerciseResults.every(
                (r) => r.hintsUsed === 0,
              );
              if (noHints) conditionMet = true;
            }
            break;

          case 'first_try_level':
            if (def.id === 'perfectionist_5') {
              // 3 stars on 5 levels
              conditionMet =
                getThreeStarLevelCount(state.levelProgress) >= def.condition.value;
            } else if (context.stars === 3) {
              conditionMet = true;
            }
            break;

          case 'speed_level':
            if (
              context.timeSeconds != null &&
              context.timeSeconds <= def.condition.value
            ) {
              conditionMet = true;
            }
            break;

          case 'night_owl': {
            const hour = new Date().getHours();
            conditionMet = hour >= 22 || hour < 5;
            break;
          }
        }

        if (conditionMet) {
          const achievement: Achievement = {
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            category: def.category,
            unlockedAt: new Date().toISOString(),
          };

          state.unlockAchievement(achievement);
          notificationStore.getState().push(achievement);
          newlyUnlocked.push(achievement);
        }
      }

      return newlyUnlocked;
    },
    [],
  );

  const checkAfterExercise = useCallback(
    (levelId: string, _exerciseId: string) => {
      return checkAndUnlock({ levelId });
    },
    [checkAndUnlock],
  );

  const checkAfterLevel = useCallback(
    (
      levelId: string,
      stars: number,
      timeSeconds: number,
      exerciseResults: { hintsUsed: number; attempts: number }[],
    ) => {
      return checkAndUnlock({ levelId, stars, timeSeconds, exerciseResults });
    },
    [checkAndUnlock],
  );

  return { checkAfterExercise, checkAfterLevel };
}
