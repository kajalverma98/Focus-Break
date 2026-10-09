import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useToast } from '../components/Toast';
import { ensureNotificationPermission, setDailyReminder } from '../services/notifications';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setAutoStartNext,
  setHaptics,
  setNotificationPref,
  type NotificationPrefs,
} from '../store/slices/settingsSlice';
import { useTheme } from '../theme';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { notifications, haptics, autoStartNext } = useAppSelector((s) => s.settings);

  const toggle = async (key: keyof NotificationPrefs, value: boolean) => {
    if (value) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        toast.show('Notifications are blocked. Enable them in your phone settings.', 'error');
        return;
      }
    }
    if (key === 'dailyReminder') {
      const done = await setDailyReminder(value);
      if (!done) {
        toast.show('Could not schedule the reminder.', 'error');
        return;
      }
    }
    dispatch(setNotificationPref({ key, value }));
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Notifications" />
      <Card style={styles.card} padding={0}>
        <ListRow
          icon="alarm-outline"
          title="Session alerts"
          subtitle="Notify me when a focus session ends"
          switchValue={notifications.sessionAlerts}
          onSwitchChange={(v) => toggle('sessionAlerts', v)}
        />
        <ListRow
          icon="cafe-outline"
          title="Break reminders"
          subtitle="Notify me when a break is over"
          switchValue={notifications.breakReminders}
          onSwitchChange={(v) => toggle('breakReminders', v)}
        />
        <ListRow
          icon="calendar-outline"
          title="Daily reminder"
          subtitle="Every day at 9:00 AM"
          switchValue={notifications.dailyReminder}
          onSwitchChange={(v) => toggle('dailyReminder', v)}
          last
        />
      </Card>

      <Text style={[styles.heading, { color: colors.text }]}>Behaviour</Text>
      <Card style={styles.card} padding={0}>
        <ListRow
          icon="play-forward-outline"
          title="Auto-start next focus"
          subtitle="Begin the next session when a break ends"
          switchValue={autoStartNext}
          onSwitchChange={(v) => dispatch(setAutoStartNext(v))}
        />
        <ListRow
          icon="phone-portrait-outline"
          title="Haptic feedback"
          subtitle="Gentle vibrations on key actions"
          switchValue={haptics}
          onSwitchChange={(v) => dispatch(setHaptics(v))}
          last
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 14, paddingHorizontal: 18 },
  heading: { fontSize: 16, fontWeight: '800', marginTop: 24 },
});
