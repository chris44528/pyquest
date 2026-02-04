import { create } from 'zustand';
import type { Achievement } from '@/types/progression';

interface AchievementNotification extends Achievement {}

interface AchievementNotificationStore {
  queue: AchievementNotification[];
  push: (achievement: AchievementNotification) => void;
  dismiss: () => void;
}

export const useAchievementNotificationStore = create<AchievementNotificationStore>()(
  (set) => ({
    queue: [],

    push: (achievement) =>
      set((state) => ({
        queue: [...state.queue, achievement],
      })),

    dismiss: () =>
      set((state) => ({
        queue: state.queue.slice(1),
      })),
  }),
);
