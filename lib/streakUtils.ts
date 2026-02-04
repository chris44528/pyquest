export interface StreakMilestone {
  days: number;
  label: string;
  emoji: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, label: '3-Day Streak!', emoji: '\uD83D\uDD25' },
  { days: 7, label: 'Week Warrior!', emoji: '\u2B50' },
  { days: 14, label: 'Two-Week Titan!', emoji: '\uD83D\uDCAA' },
  { days: 30, label: 'Monthly Master!', emoji: '\uD83C\uDFC6' },
  { days: 100, label: 'Century Champion!', emoji: '\uD83D\uDC8E' },
];

export function isStreakAtRisk(lastActivityDate: string): boolean {
  if (!lastActivityDate) return false;

  const today = new Date().toISOString().split('T')[0];
  if (lastActivityDate === today) return false;

  const lastDate = new Date(lastActivityDate);
  const todayDate = new Date(today);
  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}

export function getNewlyReachedMilestone(
  previousStreak: number,
  currentStreak: number,
): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (previousStreak < milestone.days && currentStreak >= milestone.days) {
      return milestone;
    }
  }
  return null;
}
