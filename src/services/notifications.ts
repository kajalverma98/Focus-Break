import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'focus-break';
const DAILY_ID = 'fb-daily-reminder';
let sessionEndId: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
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
  try {
    const ok = await ensureNotificationPermission();
    if (!ok || seconds < 1) return;
    sessionEndId = await Notifications.scheduleNotificationAsync({
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
    sessionEndId = null;
  }
}

export async function cancelSessionEnd(): Promise<void> {
  if (!sessionEndId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(sessionEndId);
  } catch {
    // ignore
  }
  sessionEndId = null;
}

export async function setDailyReminder(enabled: boolean): Promise<boolean> {
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
  sessionEndId = null;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
