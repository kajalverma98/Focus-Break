import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/api';
import { cancelAllNotifications, cancelSessionEnd, scheduleSessionEnd } from '../services/notifications';
import { stopAmbient } from '../services/ambient';
import type { NewSession } from '../types';
import type { AppDispatch, RootState } from './index';
import { logout } from './slices/authSlice';
import { setPending, queueSession } from './slices/statsSlice';
import {
  endPhase,
  focusFinished,
  resetTimer,
  startBreak,
  startFocus,
} from './slices/timerSlice';
import { pickActivity } from '../constants/activities';

type ThunkConfig = { state: RootState; dispatch: AppDispatch };

/** Saves a session to the API; if that fails it is queued and retried later. */
async function saveOrQueue(dispatch: AppDispatch, payload: NewSession) {
  try {
    await dispatch(api.endpoints.addSession.initiate(payload)).unwrap();
  } catch {
    dispatch(queueSession(payload));
  }
}

export const beginFocus = createAsyncThunk<void, void, ThunkConfig>('timer/beginFocus', async (_, { dispatch, getState }) => {
  const { focusMinutes } = getState().settings;
  dispatch(startFocus({ minutes: focusMinutes, now: Date.now() }));
  await scheduleSessionEnd('focus', focusMinutes * 60);
});

export const completeFocus = createAsyncThunk<void, void, ThunkConfig>('timer/completeFocus', async (_, { dispatch, getState }) => {
  const state = getState();
  const minutes = Math.round(state.timer.totalMs / 60000);
  const distractions = state.timer.distractions;
  dispatch(focusFinished({ minutes }));
  stopAmbient();
  // Upload in the background so the UI can move on immediately.
  void saveOrQueue(dispatch, { focusMinutes: minutes, breaks: 0, distractions });
});

export const beginBreak = createAsyncThunk<void, void, ThunkConfig>('timer/beginBreak', async (_, { dispatch, getState }) => {
  const { settings, timer } = getState();
  const long = timer.completedSessions >= settings.sessionsBeforeLongBreak;
  const minutes = long ? settings.longBreakMinutes : settings.breakMinutes;
  dispatch(
    startBreak({ minutes, long, activityId: pickActivity(timer.activityId).id, now: Date.now() }),
  );
  await scheduleSessionEnd('break', minutes * 60);
});

export const completeBreak = createAsyncThunk<void, void, ThunkConfig>('timer/completeBreak', async (_, { dispatch }) => {
  dispatch(endPhase());
  void saveOrQueue(dispatch, { focusMinutes: 0, breaks: 1, distractions: 0 });
});

/** Abandon the running phase (user left early) without recording anything. */
export const abandonPhase = createAsyncThunk<void, void, ThunkConfig>('timer/abandonPhase', async (_, { dispatch }) => {
  await cancelSessionEnd();
  stopAmbient();
  dispatch(endPhase());
});

/** Retries sessions that could not be uploaded earlier. */
export const flushPendingSessions = createAsyncThunk<void, void, ThunkConfig>('stats/flushPending', async (_, { dispatch, getState }) => {
  const pending = getState().stats.pending;
  if (pending.length === 0) return;
  const remaining: NewSession[] = [];
  for (const item of pending) {
    try {
      await dispatch(api.endpoints.addSession.initiate(item)).unwrap();
    } catch {
      remaining.push(item);
    }
  }
  dispatch(setPending(remaining));
});

export const performLogout = createAsyncThunk<void, void, ThunkConfig>('auth/performLogout', async (_, { dispatch }) => {
  await cancelAllNotifications();
  stopAmbient();
  dispatch(resetTimer());
  dispatch(setPending([]));
  dispatch(logout());
  dispatch(api.util.resetApiState());
});
