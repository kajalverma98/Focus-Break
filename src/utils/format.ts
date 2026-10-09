export function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** 1500 seconds -> "25:00" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

/** 275 minutes -> "4h 35m", 25 -> "25m", 120 -> "2h" */
export function formatMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function firstName(name?: string | null): string {
  if (!name) return 'there';
  return name.trim().split(/\s+/)[0] ?? 'there';
}

export function initial(name?: string | null): string {
  return (name?.trim().charAt(0) || '?').toUpperCase();
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { data?: { message?: string }; message?: string };
    if (e.data?.message) return e.data.message;
    if (e.message) return e.message;
  }
  return fallback;
}
