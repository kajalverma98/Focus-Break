export interface Option<T extends string | number = number> {
  label: string;
  value: T;
}

export const WORK_HOUR_OPTIONS: Option[] = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} ${i === 0 ? 'hour' : 'hours'}`,
}));

export const FOCUS_OPTIONS: Option[] = [15, 20, 25, 30, 45, 50, 60, 90].map((m) => ({
  value: m,
  label: `${m} minutes`,
}));

export const BREAK_OPTIONS: Option[] = [3, 5, 10, 15].map((m) => ({
  value: m,
  label: `${m} minutes`,
}));

export const LONG_BREAK_OPTIONS: Option[] = [10, 15, 20, 30].map((m) => ({
  value: m,
  label: `${m} minutes`,
}));

export const QUOTES: string[] = [
  'Better focus today. Brighter tomorrow.',
  'Small steps make big progress.',
  'Rest is part of the work.',
  'One session at a time.',
  'Deep work, then deep rest.',
  'Progress, not perfection.',
  'Your future self will thank you.',
];

export function quoteOfTheDay(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86400000);
  return QUOTES[day % QUOTES.length];
}
