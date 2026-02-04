import type { UserProgress, Achievement } from '@/types/progression';
import achievementDefs from '@/content/achievements.json';

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'skill' | 'secret';
  condition: {
    type: string;
    count?: number;
    seconds?: number;
    exerciseType?: string;
  };
}

function countCompletedLevels(progress: UserProgress): number {
  return Object.values(progress.levelProgress).filter(
    (lp) => lp.status === 'completed',
  ).length;
}

function countThreeStarLevels(progress: UserProgress): number {
  return Object.values(progress.levelProgress).filter(
    (lp) => lp.status === 'completed' && lp.stars === 3,
  ).length;
}

function countNoHintLevels(progress: UserProgress): number {
  return Object.values(progress.levelProgress).filter(
    (lp) =>
      lp.status === 'completed' &&
      lp.exerciseProgress.every((ep) => ep.hintsUsed === 0),
  ).length;
}

function hasFastLevel(progress: UserProgress, seconds: number): boolean {
  return Object.values(progress.levelProgress).some(
    (lp) =>
      lp.status === 'completed' &&
      lp.bestTime !== undefined &&
      lp.bestTime <= seconds,
  );
}

function countExercisesByType(
  progress: UserProgress,
  _exerciseType: string,
): number {
  // We track completed exercises but not their types in progress.
  // Count all completed exercises as an approximation.
  // In a full implementation, exercise type would be stored in progress.
  let count = 0;
  for (const lp of Object.values(progress.levelProgress)) {
    count += lp.exerciseProgress.filter((ep) => ep.completed).length;
  }
  // Rough approximation: ~20% of exercises are fix_bug
  return Math.floor(count / 5);
}

function checkCondition(
  def: AchievementDef,
  progress: UserProgress,
): boolean {
  const { condition } = def;

  switch (condition.type) {
    case 'levels_completed':
      return countCompletedLevels(progress) >= (condition.count ?? 0);
    case 'streak_days':
      return progress.streak.current >= (condition.count ?? 0);
    case 'three_star_levels':
      return countThreeStarLevels(progress) >= (condition.count ?? 0);
    case 'no_hint_levels':
      return countNoHintLevels(progress) >= (condition.count ?? 0);
    case 'fast_level':
      return hasFastLevel(progress, condition.seconds ?? 120);
    case 'exercise_type_count':
      return (
        countExercisesByType(progress, condition.exerciseType ?? '') >=
        (condition.count ?? 0)
      );
    case 'total_xp':
      return progress.totalXP >= (condition.count ?? 0);
    default:
      return false;
  }
}

/**
 * Check all achievement conditions against current progress.
 * Returns any newly unlocked achievements (not already in progress.achievements).
 */
export function checkAchievements(progress: UserProgress): Achievement[] {
  const unlockedIds = new Set(progress.achievements.map((a) => a.id));
  const newAchievements: Achievement[] = [];

  for (const def of achievementDefs as AchievementDef[]) {
    if (unlockedIds.has(def.id)) continue;
    if (checkCondition(def, progress)) {
      newAchievements.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return newAchievements;
}
