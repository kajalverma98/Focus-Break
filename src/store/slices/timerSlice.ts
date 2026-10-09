import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Phase = 'idle' | 'focus' | 'focusDone' | 'break';

export interface TimerState {
  phase: Phase;
  running: boolean;
  /** Epoch ms when the current phase ends (only while running). */
  endAt: number | null;
  /** Remaining ms while paused / idle. */
  remainingMs: number;
  totalMs: number;
  /** Focus sessions completed in the current cycle (drives long breaks). */
  completedSessions: number;
  distractions: number;
  isLongBreak: boolean;
  activityId: string;
  lastFocusMinutes: number;
}

const initialState: TimerState = {
  phase: 'idle',
  running: false,
  endAt: null,
  remainingMs: 0,
  totalMs: 0,
  completedSessions: 0,
  distractions: 0,
  isLongBreak: false,
  activityId: 'blink',
  lastFocusMinutes: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    /** Show an un-started focus session (idle ring with full duration). */
    prepareFocus(state, action: PayloadAction<{ minutes: number }>) {
      state.phase = 'idle';
      state.running = false;
      state.endAt = null;
      state.totalMs = action.payload.minutes * 60000;
      state.remainingMs = state.totalMs;
      state.distractions = 0;
    },
    startFocus(state, action: PayloadAction<{ minutes: number; now: number }>) {
      const total = action.payload.minutes * 60000;
      state.phase = 'focus';
      state.running = true;
      state.totalMs = total;
      state.remainingMs = total;
      state.endAt = action.payload.now + total;
      state.distractions = 0;
    },
    pause(state, action: PayloadAction<{ now: number }>) {
      if (!state.running || state.endAt === null) return;
      state.remainingMs = Math.max(0, state.endAt - action.payload.now);
      state.running = false;
      state.endAt = null;
    },
    resume(state, action: PayloadAction<{ now: number }>) {
      if (state.running || state.remainingMs <= 0) return;
      state.running = true;
      state.endAt = action.payload.now + state.remainingMs;
    },
    addDistraction(state) {
      state.distractions += 1;
    },
    focusFinished(state, action: PayloadAction<{ minutes: number }>) {
      state.phase = 'focusDone';
      state.running = false;
      state.endAt = null;
      state.remainingMs = 0;
      state.completedSessions += 1;
      state.lastFocusMinutes = action.payload.minutes;
    },
    startBreak(
      state,
      action: PayloadAction<{ minutes: number; long: boolean; activityId: string; now: number }>,
    ) {
      const total = action.payload.minutes * 60000;
      state.phase = 'break';
      state.running = true;
      state.totalMs = total;
      state.remainingMs = total;
      state.endAt = action.payload.now + total;
      state.isLongBreak = action.payload.long;
      state.activityId = action.payload.activityId;
      if (action.payload.long) state.completedSessions = 0;
    },
    setActivity(state, action: PayloadAction<string>) {
      state.activityId = action.payload;
    },
    /** Abandon the current phase without saving anything. */
    endPhase(state) {
      state.phase = 'idle';
      state.running = false;
      state.endAt = null;
      state.remainingMs = 0;
      state.distractions = 0;
    },
    resetTimer() {
      return initialState;
    },
  },
});

export const {
  prepareFocus,
  startFocus,
  pause,
  resume,
  addDistraction,
  focusFinished,
  startBreak,
  setActivity,
  endPhase,
  resetTimer,
} = timerSlice.actions;
export default timerSlice.reducer;
