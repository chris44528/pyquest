const LEVELS = [
  { level: 1, title: 'Beginner', xpRequired: 0 },
  { level: 2, title: 'Novice', xpRequired: 100 },
  { level: 3, title: 'Learner', xpRequired: 250 },
  { level: 4, title: 'Apprentice', xpRequired: 500 },
  { level: 5, title: 'Coder', xpRequired: 1000 },
  { level: 6, title: 'Developer', xpRequired: 2000 },
  { level: 7, title: 'Programmer', xpRequired: 3500 },
  { level: 8, title: 'Engineer', xpRequired: 5500 },
  { level: 9, title: 'Expert', xpRequired: 8000 },
  { level: 10, title: 'Pythonista', xpRequired: 12000 },
];

export interface PlayerLevelInfo {
  level: number;
  title: string;
  xpForCurrent: number;
  xpForNext: number;
  xpProgress: number;     // 0-1 progress toward next level
  isMaxLevel: boolean;
}

export function getPlayerLevel(totalXP: number): PlayerLevelInfo {
  let currentLevel = LEVELS[0];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return {
      level: currentLevel.level,
      title: currentLevel.title,
      xpForCurrent: currentLevel.xpRequired,
      xpForNext: currentLevel.xpRequired,
      xpProgress: 1,
      isMaxLevel: true,
    };
  }

  const xpIntoLevel = totalXP - currentLevel.xpRequired;
  const xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = Math.min(xpIntoLevel / xpNeeded, 1);

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpForCurrent: currentLevel.xpRequired,
    xpForNext: nextLevel.xpRequired,
    xpProgress: progress,
    isMaxLevel: false,
  };
}
