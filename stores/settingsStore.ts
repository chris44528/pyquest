import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  haptics: boolean;
  notifications: boolean;
  soundEffects: boolean;
}

interface SettingsActions {
  setTheme: (theme: ThemeMode) => void;
  setHaptics: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      haptics: true,
      notifications: true,
      soundEffects: true,

      setTheme: (theme: ThemeMode) => set({ theme }),
      setHaptics: (enabled: boolean) => set({ haptics: enabled }),
      setNotifications: (enabled: boolean) => set({ notifications: enabled }),
      setSoundEffects: (enabled: boolean) => set({ soundEffects: enabled }),
    }),
    {
      name: 'pyquest-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
