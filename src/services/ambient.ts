import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { getSound } from '../constants/sounds';

let player: AudioPlayer | null = null;
let currentId: string | null = null;
let modeSet = false;

async function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {
    // ignore
  }
}

export function stopAmbient(): void {
  if (player) {
    try {
      player.pause();
      player.remove();
    } catch {
      // ignore
    }
  }
  player = null;
  currentId = null;
}

export function pauseAmbient(): void {
  try {
    player?.pause();
  } catch {
    // ignore
  }
}

/** Starts looping the sound with the given id. "none" stops playback. */
export async function playAmbient(soundId: string): Promise<void> {
  const sound = getSound(soundId);
  if (!sound.source) {
    stopAmbient();
    return;
  }
  await ensureMode();
  try {
    if (player && currentId === sound.id) {
      player.play();
      return;
    }
    stopAmbient();
    player = createAudioPlayer(sound.source);
    player.loop = true;
    player.volume = 0.6;
    player.play();
    currentId = sound.id;
  } catch {
    stopAmbient();
  }
}
