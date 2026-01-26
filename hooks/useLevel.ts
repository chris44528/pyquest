import { useState, useEffect } from 'react';
import type { Level } from '@/types/content';
import { getLevel } from '@/lib/contentLoader';

interface UseLevelResult {
  level: Level | null;
  isLoading: boolean;
  error: string | null;
}

export function useLevel(worldId: string, levelId: string): UseLevelResult {
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const loaded = getLevel(worldId, levelId);
      if (loaded) {
        setLevel(loaded);
      } else {
        setError(`Level ${levelId} not found in world ${worldId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load level');
    } finally {
      setIsLoading(false);
    }
  }, [worldId, levelId]);

  return { level, isLoading, error };
}
