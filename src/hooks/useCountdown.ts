import { useEffect, useRef, useState } from 'react';

interface Options {
  running: boolean;
  endAt: number | null;
  remainingMs: number;
  onComplete: () => void;
}

/**
 * Wall-clock based countdown: remaining time is derived from `endAt`, so it stays
 * accurate when the app is backgrounded or the JS thread is busy.
 */
export function useCountdown({ running, endAt, remainingMs, onComplete }: Options): number {
  const [now, setNow] = useState(() => Date.now());
  const doneRef = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    doneRef.current = false;
  }, [endAt]);

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const ms = running && endAt !== null ? Math.max(0, endAt - now) : remainingMs;

  useEffect(() => {
    if (running && endAt !== null && ms <= 0 && !doneRef.current) {
      doneRef.current = true;
      completeRef.current();
    }
  }, [ms, running, endAt]);

  return ms;
}
