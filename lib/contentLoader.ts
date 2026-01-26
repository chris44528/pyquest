import type { Level } from '@/types/content';

// Static registry — Metro requires static require() calls at build time.
// Add new levels here as they are created.
const LEVEL_REGISTRY: Record<string, Record<string, Level>> = {
  world1: {
    level1: require('@/content/worlds/world1/level1.json'),
  },
};

const levelCache = new Map<string, Level>();

export function getLevel(worldId: string, levelId: string): Level | null {
  const cacheKey = `${worldId}/${levelId}`;

  const cached = levelCache.get(cacheKey);
  if (cached) return cached;

  const worldLevels = LEVEL_REGISTRY[worldId];
  if (!worldLevels) return null;

  const level = worldLevels[levelId];
  if (!level) return null;

  levelCache.set(cacheKey, level);
  return level;
}

export function getLevelIds(worldId: string): string[] {
  const worldLevels = LEVEL_REGISTRY[worldId];
  if (!worldLevels) return [];
  return Object.keys(worldLevels);
}
