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
