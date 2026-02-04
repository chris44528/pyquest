import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/stores/settingsStore';

type HapticType = 'success' | 'light' | 'medium' | 'selection';

export function triggerHaptic(type: HapticType): void {
  const hapticsEnabled = useSettingsStore.getState().haptics;
  if (!hapticsEnabled) return;

  switch (type) {
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'selection':
      Haptics.selectionAsync();
      break;
  }
}

// Convenience aliases used by tab bar and settings
export function tapHaptic(): void {
  triggerHaptic('selection');
}

export function celebrationHaptic(): void {
  triggerHaptic('success');
}

export function successHaptic(): void {
  triggerHaptic('light');
}

export function errorHaptic(): void {
  const hapticsEnabled = useSettingsStore.getState().haptics;
  if (!hapticsEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
