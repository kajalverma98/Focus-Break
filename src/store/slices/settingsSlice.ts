import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationPrefs {
  sessionAlerts: boolean;
  breakReminders: boolean;
  dailyReminder: boolean;
}

export interface SettingsState {
  hasSeenOnboarding: boolean;
  workHours: number;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartNext: boolean;
  soundId: string;
  haptics: boolean;
  notifications: NotificationPrefs;
}

const initialState: SettingsState = {
  hasSeenOnboarding: false,
  workHours: 8,
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartNext: true,
  soundId: 'none',
  haptics: true,
  notifications: { sessionAlerts: true, breakReminders: true, dailyReminder: false },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    completeOnboarding(state) {
      state.hasSeenOnboarding = true;
    },
    setWorkSetup(
      state,
      action: PayloadAction<Pick<SettingsState, 'workHours' | 'focusMinutes' | 'breakMinutes' | 'longBreakMinutes'>>,
    ) {
      Object.assign(state, action.payload);
    },
    setSound(state, action: PayloadAction<string>) {
      state.soundId = action.payload;
    },
    setHaptics(state, action: PayloadAction<boolean>) {
      state.haptics = action.payload;
    },
    setAutoStartNext(state, action: PayloadAction<boolean>) {
      state.autoStartNext = action.payload;
    },
    setNotificationPref(state, action: PayloadAction<{ key: keyof NotificationPrefs; value: boolean }>) {
      state.notifications[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  completeOnboarding,
  setWorkSetup,
  setSound,
  setHaptics,
  setAutoStartNext,
  setNotificationPref,
} = settingsSlice.actions;
export default settingsSlice.reducer;
