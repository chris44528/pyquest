import { XP_REWARDS } from '@/types/progression';

export { XP_REWARDS };

export interface XPBreakdown {
  exerciseXP: number;
  noHintsBonus: number;
  firstTryBonus: number;
  levelBonus: number;
  streakMultiplier: number;
  total: number;
}

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.5;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 3) return 1.1;
  return 1.0;
}

export function calculateExerciseXP(params: {
  hintsUsed: number;
  attempts: number;
}): XPBreakdown {
  const { hintsUsed, attempts } = params;

  const exerciseXP = XP_REWARDS.exerciseComplete;
  const noHintsBonus = hintsUsed === 0 ? XP_REWARDS.exerciseCompleteNoHints - exerciseXP : 0;
  const firstTryBonus =
    attempts === 1 && hintsUsed === 0
      ? XP_REWARDS.exerciseCompleteFirstTry - XP_REWARDS.exerciseCompleteNoHints
      : 0;

  const subtotal = exerciseXP + noHintsBonus + firstTryBonus;

  return {
    exerciseXP,
    noHintsBonus,
    firstTryBonus,
    levelBonus: 0,
    streakMultiplier: 1.0,
    total: subtotal,
  };
}

export function calculateLevelXP(params: {
  stars: number;
  isBoss: boolean;
  bonusObjectivesPassed: number;
  exerciseResults: { hintsUsed: number; attempts: number }[];
  streakDays: number;
}): XPBreakdown {
  const { stars, isBoss, bonusObjectivesPassed, exerciseResults, streakDays } = params;

  let exerciseXP = 0;
  let noHintsBonus = 0;
  let firstTryBonus = 0;

  for (const result of exerciseResults) {
    const breakdown = calculateExerciseXP(result);
    exerciseXP += breakdown.exerciseXP;
    noHintsBonus += breakdown.noHintsBonus;
    firstTryBonus += breakdown.firstTryBonus;
  }

  let levelBonus = isBoss ? XP_REWARDS.bossComplete : XP_REWARDS.levelComplete;
  if (stars === 3 && !isBoss) levelBonus = XP_REWARDS.levelComplete3Stars;

  // Add bonus objective XP (25 XP each)
  levelBonus += bonusObjectivesPassed * 25;

  const subtotal = exerciseXP + noHintsBonus + firstTryBonus + levelBonus;
  const multiplier = getStreakMultiplier(streakDays);
  const total = Math.round(subtotal * multiplier);

  return {
    exerciseXP,
    noHintsBonus,
    firstTryBonus,
    levelBonus,
    streakMultiplier: multiplier,
    total,
  };
}
