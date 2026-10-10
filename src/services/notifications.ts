import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Expo Go on Android (SDK 53+) throws as soon as expo-notifications is loaded, so the
 * module is only required elsewhere. In Expo Go on Android every helper below is a no-op;
 * use a development build to get notifications there.
 */
const Notifications: NotificationsModule | null =
  Platform.OS === 'android' && isRunningInExpoGo()
    ? null
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('expo-notifications') as NotificationsModule);

const CHANNEL_ID = 'focus-break';
const DAILY_ID = 'fb-daily-reminder';
/** Fixed id so the alert can still be cancelled after the app was closed and reopened. */
const SESSION_END_ID = 'fb-session-end';

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotificationChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Focus & Break',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#177A57',
    });
  } catch {
    // Notifications are best-effort.
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch {
    return false;
  }
}

/** Schedules a local notification for when the running focus/break phase ends. */
export async function scheduleSessionEnd(kind: 'focus' | 'break', seconds: number): Promise<void> {
  await cancelSessionEnd();
  if (!Notifications) return;
  try {
    const ok = await ensureNotificationPermission();
    if (!ok || seconds < 1) return;
    await Notifications.scheduleNotificationAsync({
      identifier: SESSION_END_ID,
      content:
        kind === 'focus'
          ? { title: 'Focus session complete 🎉', body: 'Great work! Time to take a healthy break.' }
          : { title: 'Break is over', body: 'Ready for your next focus session?' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.ceil(seconds),
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    // Notifications are best-effort.
  }
}

export async function cancelSessionEnd(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(SESSION_END_ID);
  } catch {
    // ignore
  }
}

export async function setDailyReminder(enabled: boolean): Promise<boolean> {
  if (!Notifications) return !enabled;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_ID);
  } catch {
    // ignore
  }
  if (!enabled) return true;
  const ok = await ensureNotificationPermission();
  if (!ok) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: 'Time to focus 🌿',
        body: 'Start a focus session and keep your streak going.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

/**
 * Android 14+ denies SCHEDULE_EXACT_ALARM to new installs, so session-end alerts can
 * arrive minutes late until the user allows "Alarms & reminders" for the app.
 */
export function needsExactAlarmPermission(): boolean {
  return !!Notifications && Platform.OS === 'android' && Number(Platform.Version) >= 34;
}

/** Opens the system "Alarms & reminders" screen for this app. */
export async function openExactAlarmSettings(): Promise<void> {
  try {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM, {
      data: `package:${Application.applicationId}`,
    });
  } catch {
    // Settings screen unavailable on this device; alerts stay best-effort.
  }
}
