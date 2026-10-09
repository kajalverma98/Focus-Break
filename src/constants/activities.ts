import type { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface BreakActivity {
  id: string;
  /** Screen heading, e.g. "Time for a break!" */
  heading: string;
  subheading: string;
  title: string;
  description: string;
  icon: IconName;
}

export const BREAK_ACTIVITIES: BreakActivity[] = [
  {
    id: 'blink',
    heading: 'Time for a break!',
    subheading: 'Relax, recharge and come back stronger.',
    title: 'Blink your eyes',
    description: 'Blink 20 times, then close your eyes for 30 seconds.',
    icon: 'eye-outline',
  },
  {
    id: 'walk',
    heading: 'Move your body',
    subheading: 'A little movement goes a long way.',
    title: 'Go for a short walk',
    description: 'Walk around, stretch your body and get some fresh air.',
    icon: 'walk-outline',
  },
  {
    id: 'water',
    heading: 'Hydrate yourself',
    subheading: 'Your brain works best when you are hydrated.',
    title: 'Drink a glass of water',
    description: 'Fill your bottle and take slow, steady sips.',
    icon: 'water-outline',
  },
  {
    id: 'breathe',
    heading: 'Breathe deeply',
    subheading: 'Slow breathing calms your mind.',
    title: 'Box breathing',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 5 times.',
    icon: 'leaf-outline',
  },
  {
    id: 'stretch',
    heading: 'Move your body',
    subheading: 'Release the tension from sitting.',
    title: 'Neck & shoulder stretch',
    description: 'Roll your shoulders back and gently tilt your neck side to side.',
    icon: 'body-outline',
  },
  {
    id: 'far',
    heading: 'Time for a break!',
    subheading: 'Give your eyes a rest from the screen.',
    title: 'Look far away',
    description: 'Look at something 20 feet away for 20 seconds.',
    icon: 'telescope-outline',
  },
  {
    id: 'fresh-air',
    heading: 'Move your body',
    subheading: 'A change of scenery refreshes your mind.',
    title: 'Step outside',
    description: 'Take a few minutes of daylight and fresh air.',
    icon: 'sunny-outline',
  },
  {
    id: 'music',
    heading: 'Time for a break!',
    subheading: 'Let your mind wander for a moment.',
    title: 'Listen to a song',
    description: 'Put on one calming song and just listen.',
    icon: 'musical-notes-outline',
  },
  {
    id: 'stand',
    heading: 'Move your body',
    subheading: 'Get your blood flowing again.',
    title: 'Stand up and stretch',
    description: 'Reach up high, touch your toes and roll your wrists.',
    icon: 'accessibility-outline',
  },
];

export function getActivity(id: string): BreakActivity {
  return BREAK_ACTIVITIES.find((a) => a.id === id) ?? BREAK_ACTIVITIES[0];
}

/** Pick a random activity that differs from `currentId`. */
export function pickActivity(currentId?: string): BreakActivity {
  const pool = BREAK_ACTIVITIES.filter((a) => a.id !== currentId);
  return pool[Math.floor(Math.random() * pool.length)];
}
