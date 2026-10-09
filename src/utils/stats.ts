import type { Session, StatsRange } from '../types';
import { pad } from './format';

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday-based start of week. */
export function startOfWeek(d: Date): Date {
  const s = startOfDay(d);
  const dow = (s.getDay() + 6) % 7; // Mon=0 … Sun=6
  s.setDate(s.getDate() - dow);
  return s;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function rangeStart(range: StatsRange, now: Date): Date {
  if (range === 'today') return startOfDay(now);
  if (range === 'week') return startOfWeek(now);
  return startOfMonth(now);
}

export function daysElapsedInRange(range: StatsRange, now: Date): number {
  if (range === 'today') return 1;
  if (range === 'week') return ((now.getDay() + 6) % 7) + 1;
  return now.getDate();
}

export interface Summary {
  focusMinutes: number;
  sessions: number;
  breaks: number;
  distractions: number;
}

export function summarize(sessions: Session[], range: StatsRange, now = new Date()): Summary {
  const start = rangeStart(range, now).getTime();
  const out: Summary = { focusMinutes: 0, sessions: 0, breaks: 0, distractions: 0 };
  for (const s of sessions) {
    if (new Date(s.date).getTime() < start) continue;
    out.focusMinutes += s.focusMinutes;
    out.breaks += s.breaks;
    out.distractions += s.distractions;
    if (s.focusMinutes > 0) out.sessions += 1;
  }
  return out;
}

export function goalPercent(focusMinutes: number, workHours: number, range: StatsRange, now = new Date()): number {
  const goal = workHours * 60 * daysElapsedInRange(range, now);
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((focusMinutes / goal) * 100));
}

export interface TrendPoint {
  label: string;
  minutes: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function weekTrend(sessions: Session[], now = new Date()): TrendPoint[] {
  const start = startOfWeek(now);
  const pts = DAY_LABELS.map((label) => ({ label, minutes: 0 }));
  for (const s of sessions) {
    if (s.focusMinutes <= 0) continue;
    const d = startOfDay(new Date(s.date));
    const idx = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (idx >= 0 && idx < 7) pts[idx].minutes += s.focusMinutes;
  }
  return pts;
}

/** Four weekly buckets ending with the current week. */
export function monthTrend(sessions: Session[], now = new Date()): TrendPoint[] {
  const thisWeek = startOfWeek(now).getTime();
  const pts: TrendPoint[] = [3, 2, 1, 0].map((ago) => ({
    label: ago === 0 ? 'This wk' : `${ago}w ago`,
    minutes: 0,
  }));
  for (const s of sessions) {
    if (s.focusMinutes <= 0) continue;
    const w = startOfWeek(new Date(s.date)).getTime();
    const ago = Math.round((thisWeek - w) / (7 * 86400000));
    if (ago >= 0 && ago <= 3) pts[3 - ago].minutes += s.focusMinutes;
  }
  return pts;
}

export interface StreakInfo {
  current: number;
  longest: number;
  activeDays: Set<string>;
}

export function computeStreaks(sessions: Session[], now = new Date()): StreakInfo {
  const activeDays = new Set<string>();
  for (const s of sessions) {
    if (s.focusMinutes > 0) activeDays.add(dayKey(new Date(s.date)));
  }

  // Current streak: consecutive days ending today (or yesterday if nothing yet today).
  let current = 0;
  const cursor = startOfDay(now);
  if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(dayKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak across all history.
  const sorted = Array.from(activeDays).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (prev && Math.round((date.getTime() - prev.getTime()) / 86400000) === 1) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = date;
  }
  return { current, longest: Math.max(longest, current), activeDays };
}
