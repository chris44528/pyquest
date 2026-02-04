import { Audio } from 'expo-av';
import { useSettingsStore } from '@/stores/settingsStore';

let soundsLoaded = false;
const sounds: Record<string, Audio.Sound | null> = {
  correct: null,
  wrong: null,
  levelComplete: null,
  achievement: null,
};

function isEnabled(): boolean {
  return useSettingsStore.getState().soundEffects;
}

async function ensureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: false,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
  });
}

/**
 * Generate a simple WAV buffer for a tone.
 * This avoids needing to bundle external sound files.
 */
function generateToneWav(
  frequency: number,
  durationMs: number,
  volume: number = 0.3,
  fadeOut: boolean = true,
): string {
  const sampleRate = 22050;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2; // 16-bit mono
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    const envelope = fadeOut ? 1 - progress : 1;
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped * 32767, true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Generate a multi-tone WAV (for chords/jingles)
 */
function generateChordWav(
  frequencies: number[],
  durationMs: number,
  volume: number = 0.2,
): string {
  const sampleRate = 22050;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    const envelope = 1 - progress * progress; // quadratic fade
    let sample = 0;
    for (const freq of frequencies) {
      sample += Math.sin(2 * Math.PI * freq * t);
    }
    sample = (sample / frequencies.length) * volume * envelope;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function loadSounds(): Promise<void> {
  if (soundsLoaded) return;
  try {
    await ensureAudioMode();

    // Correct: ascending two-tone (C5 → E5)
    const correctData = generateToneWav(523, 100, 0.25);
    const { sound: correctSound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${correctData}` },
      { shouldPlay: false },
    );
    sounds.correct = correctSound;

    // Wrong: low buzz (A3)
    const wrongData = generateToneWav(220, 200, 0.2, true);
    const { sound: wrongSound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${wrongData}` },
      { shouldPlay: false },
    );
    sounds.wrong = wrongSound;

    // Level complete: major chord (C4-E4-G4)
    const levelData = generateChordWav([262, 330, 392], 600, 0.2);
    const { sound: levelSound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${levelData}` },
      { shouldPlay: false },
    );
    sounds.levelComplete = levelSound;

    // Achievement: high sparkle (E5-G#5)
    const achieveData = generateChordWav([659, 831], 400, 0.2);
    const { sound: achieveSound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${achieveData}` },
      { shouldPlay: false },
    );
    sounds.achievement = achieveSound;

    soundsLoaded = true;
  } catch {
    // Sounds are non-essential; silently fail
  }
}

async function play(name: keyof typeof sounds): Promise<void> {
  if (!isEnabled()) return;
  const sound = sounds[name];
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Non-essential
  }
}

export async function playCorrect(): Promise<void> {
  await play('correct');
}

export async function playWrong(): Promise<void> {
  await play('wrong');
}

export async function playLevelComplete(): Promise<void> {
  await play('levelComplete');
}

export async function playAchievement(): Promise<void> {
  await play('achievement');
}

export async function unloadSounds(): Promise<void> {
  for (const key of Object.keys(sounds)) {
    const sound = sounds[key as keyof typeof sounds];
    if (sound) {
      await sound.unloadAsync();
      sounds[key as keyof typeof sounds] = null;
    }
  }
  soundsLoaded = false;
}
