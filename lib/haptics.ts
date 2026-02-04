import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/stores/settingsStore';

function isEnabled(): boolean {
  return useSettingsStore.getState().haptics;
}

export function celebrationHaptic(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function successHaptic(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function errorHaptic(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function tapHaptic(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
}
