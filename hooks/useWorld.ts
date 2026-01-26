import { useMemo } from 'react';
import { getWorld, getLevel } from '@/lib/contentLoader';
import { useProgressStore } from '@/stores/progressStore';
import type { WorldMeta } from '@/types/content';
import type { LevelStatus, StarRating } from '@/types/progression';

export interface LevelSummary {
  id: string;
  title: string;
  concept: string;
  status: LevelStatus;
  stars: StarRating;
  isBoss: boolean;
}

export interface WorldData {
  meta: WorldMeta | null;
  levels: LevelSummary[];
  completionPercent: number;
  isLoading: boolean;
}

export function useWorld(worldId: string): WorldData {
  const levelProgress = useProgressStore((s) => s.levelProgress);

  return useMemo(() => {
    const meta = getWorld(worldId);
    if (!meta) {
      return { meta: null, levels: [], completionPercent: 0, isLoading: false };
    }

    const levels: LevelSummary[] = meta.levelOrder.map((levelId, index) => {
      const level = getLevel(worldId, levelId);
      const progress = levelProgress[levelId];

      let status: LevelStatus = 'locked';

      if (index === 0) {
        // First level is always available
        status = progress?.status === 'completed' ? 'completed' : (progress?.status === 'in_progress' ? 'in_progress' : 'available');
      } else {
        const prevLevelId = meta.levelOrder[index - 1];
        const prevProgress = levelProgress[prevLevelId];
        if (prevProgress?.status === 'completed') {
          status = progress?.status === 'completed' ? 'completed' : (progress?.status === 'in_progress' ? 'in_progress' : 'available');
        }
      }

      return {
        id: levelId,
        title: level?.title ?? `Level ${index + 1}`,
        concept: level?.concept ?? '',
        status,
        stars: (progress?.stars ?? 0) as StarRating,
        isBoss: levelId === meta.bossLevelId,
      };
    });

    const completedCount = levels.filter((l) => l.status === 'completed').length;
    const completionPercent = levels.length > 0 ? Math.round((completedCount / levels.length) * 100) : 0;

    return { meta, levels, completionPercent, isLoading: false };
  }, [worldId, levelProgress]);
}
