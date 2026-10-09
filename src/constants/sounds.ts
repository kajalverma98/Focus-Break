import type { AudioSource } from 'expo-audio';
import type { IconName } from './activities';

export interface AmbientSound {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  /** null = silence */
  source: AudioSource | null;
}

/**
 * The bundled files in assets/sounds are short synthetic loops so the feature works
 * out of the box. Replace them with real recordings (same file names) when you have them.
 */
export const SOUNDS: AmbientSound[] = [
  { id: 'none', title: 'None', subtitle: 'Silence', icon: 'volume-mute-outline', source: null },
  {
    id: 'rain',
    title: 'Rain',
    subtitle: 'Soft rainfall',
    icon: 'rainy-outline',
    source: require('../../assets/sounds/rain.wav'),
  },
  {
    id: 'forest',
    title: 'Forest',
    subtitle: 'Wind and birds',
    icon: 'leaf-outline',
    source: require('../../assets/sounds/forest.wav'),
  },
  {
    id: 'white-noise',
    title: 'White noise',
    subtitle: 'Steady background hush',
    icon: 'pulse-outline',
    source: require('../../assets/sounds/white-noise.wav'),
  },
];

export function getSound(id: string): AmbientSound {
  return SOUNDS.find((s) => s.id === id) ?? SOUNDS[0];
}
