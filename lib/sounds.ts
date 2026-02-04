import { useSettingsStore } from '@/stores/settingsStore';

type SoundType = 'levelComplete' | 'starEarned' | 'achievementUnlock' | 'xpGain';

/**
 * Sound effect playback — currently a no-op.
 * Infrastructure is ready for audio files to be dropped into assets/sounds/.
 * When expo-av is installed and audio files are available, this will
 * preload and play short sound effects respecting settingsStore.soundEffects.
 */
export function playSound(_type: SoundType): void {
  const soundEnabled = useSettingsStore.getState().soundEffects;
  if (!soundEnabled) return;

  // No-op until audio files are added to assets/sounds/
}
