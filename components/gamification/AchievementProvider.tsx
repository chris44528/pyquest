import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AchievementToast } from './AchievementToast';
import type { Achievement } from '@/types/progression';

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void;
  showAchievements: (achievements: Achievement[]) => void;
}

const AchievementContext = createContext<AchievementContextType>({
  showAchievement: () => {},
  showAchievements: () => {},
});

export function useAchievementToast() {
  return useContext(AchievementContext);
}

interface AchievementProviderProps {
  children: ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [queue, setQueue] = useState<Achievement[]>([]);

  const showAchievement = useCallback((achievement: Achievement) => {
    setQueue((prev) => [...prev, achievement]);
  }, []);

  const showAchievements = useCallback((achievements: Achievement[]) => {
    if (achievements.length === 0) return;
    setQueue((prev) => [...prev, ...achievements]);
  }, []);

  const handleDismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const currentAchievement = queue[0] ?? null;

  return (
    <AchievementContext.Provider value={{ showAchievement, showAchievements }}>
      {children}
      {currentAchievement && (
        <AchievementToast
          key={currentAchievement.id}
          achievement={currentAchievement}
          onDismiss={handleDismiss}
        />
      )}
    </AchievementContext.Provider>
  );
}
