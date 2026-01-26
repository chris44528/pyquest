import type { Level } from '@/types/content';
import type { WorldMeta } from '@/types/content';

// Static registry — Metro requires static require() calls at build time.
const WORLD_REGISTRY: Record<string, WorldMeta> = {
  world1: require('@/content/worlds/world1/index.json'),
};

const LEVEL_REGISTRY: Record<string, Record<string, Level>> = {
  world1: {
    level1: require('@/content/worlds/world1/level1.json'),
    level2: require('@/content/worlds/world1/level2.json'),
    level3: require('@/content/worlds/world1/level3.json'),
    level4: require('@/content/worlds/world1/level4.json'),
    level5: require('@/content/worlds/world1/level5.json'),
    level6: require('@/content/worlds/world1/level6.json'),
    level7: require('@/content/worlds/world1/level7.json'),
    level8: require('@/content/worlds/world1/level8.json'),
    level9: require('@/content/worlds/world1/level9.json'),
    level10: require('@/content/worlds/world1/level10.json'),
  },
};

const levelCache = new Map<string, Level>();
const worldCache = new Map<string, WorldMeta>();

export function getWorld(worldId: string): WorldMeta | null {
  const cached = worldCache.get(worldId);
  if (cached) return cached;

  const world = WORLD_REGISTRY[worldId];
  if (!world) return null;

  worldCache.set(worldId, world);
  return world;
}

export function getWorldIds(): string[] {
  return Object.keys(WORLD_REGISTRY);
}

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
