import type { AchievementCategory } from './progression';

export type AchievementConditionType =
  | 'exercise_count'
  | 'level_count'
  | 'world_complete'
  | 'streak_days'
  | 'no_hints_level'
  | 'first_try_level'
  | 'speed_level'
  | 'night_owl'
  | 'total_xp';

export interface AchievementCondition {
  type: AchievementConditionType;
  value: number;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  xpReward: number;
  secret?: boolean;
}
