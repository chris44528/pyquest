export type LevelStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type StarRating = 0 | 1 | 2 | 3;
export type AchievementCategory = 'progress' | 'streak' | 'skill' | 'secret';

export interface StreakData {
  current: number;
  longest: number;
  lastActivityDate: string; // ISO date string (YYYY-MM-DD)
}

export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  attempts: number;
  lastSubmission?: string;
  hintsUsed: number;
}

export interface LevelProgress {
  levelId: string;
  status: LevelStatus;
  stars: StarRating;
  xpEarned: number;
  attempts: number;
  bestTime?: number; // seconds
  completedAt?: string; // ISO date
  exerciseProgress: ExerciseProgress[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string; // ISO date
  category: AchievementCategory;
}

export interface UserProgress {
  totalXP: number;
  currentWorld: number;
  currentLevel: number;
  streak: StreakData;
  levelProgress: Record<string, LevelProgress>;
  achievements: Achievement[];
}

export const XP_REWARDS: Record<string, number> = {
  exerciseComplete: 10,
  exerciseCompleteNoHints: 15,
  exerciseCompleteFirstTry: 20,
  levelComplete: 50,
  levelComplete3Stars: 100,
  bossComplete: 200,
  worldComplete: 500,
  streakDay: 25,
  achievementUnlock: 50,
};
