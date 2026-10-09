import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useGetSessionsQuery } from '../api/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LeafCorner } from '../components/Leaf';
import { Screen } from '../components/Screen';
import { quoteOfTheDay } from '../constants/options';
import type { TabNavigation } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { flushPendingSessions } from '../store/thunks';
import { radius, useTheme } from '../theme';
import { firstName, formatMinutes, greeting, plural } from '../utils/format';
import { summarize } from '../utils/stats';

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<TabNavigation>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const workHours = useAppSelector((s) => s.settings.workHours);
  const phase = useAppSelector((s) => s.timer.phase);

  const { data: sessions, isLoading, isFetching, isError, refetch } = useGetSessionsQuery();

  useEffect(() => {
    dispatch(flushPendingSessions());
  }, [dispatch]);

  const today = summarize(sessions ?? [], 'today');
  const goalMinutes = workHours * 60;
  const progress = Math.min(1, today.focusMinutes / goalMinutes);

  const startFocus = useCallback(() => {
    if (phase === 'break') navigation.navigate('BreakActivity');
    else if (phase === 'focusDone') navigation.navigate('SessionComplete');
    else navigation.navigate('FocusTimer', { autoStart: phase !== 'focus' });
  }, [navigation, phase]);

  const resumeLabel =
    phase === 'focus' ? 'Focus session in progress' : phase === 'break' ? 'Break in progress' : phase === 'focusDone' ? 'Session complete – take a break' : null;

  return (
    <Screen
      scroll
      edges={['top']}
      refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.hello, { color: colors.textMuted }]}>{greeting()},</Text>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{firstName(user?.name)}</Text>
            <Ionicons name="sunny" size={22} color={colors.accent} />
          </View>
          <Text style={[styles.motto, { color: colors.textMuted }]}>Small steps make big progress.</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          hitSlop={10}
          accessibilityLabel="Open settings"
          style={[styles.gear, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {resumeLabel ? (
        <Pressable
          onPress={startFocus}
          style={[styles.resume, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Ionicons name="play-circle" size={24} color={colors.onPrimary} />
          <Text style={{ color: colors.onPrimary, fontWeight: '700', flex: 1 }}>{resumeLabel}</Text>
          <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Resume</Text>
        </Pressable>
      ) : null}

      <Card style={styles.goalCard}>
        {isError ? (
          <View style={styles.center}>
            <Text style={{ color: colors.textMuted, marginBottom: 10 }}>Couldn't load today's progress.</Text>
            <Button title="Retry" variant="outline" onPress={refetch} style={{ minHeight: 40 }} />
          </View>
        ) : (
          <View style={styles.goalRow}>
            <View style={[styles.goalIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="checkmark-done" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalLabel, { color: colors.textMuted }]}>Today's Goal</Text>
              {isLoading ? (
                <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 6 }} />
              ) : (
                <Text style={[styles.goalValue, { color: colors.text }]}>{Math.round(progress * 100)}% complete</Text>
              )}
            </View>
          </View>
        )}
        {!isError ? (
          <>
            <View style={[styles.track, { backgroundColor: colors.primarySoft }]}>
              <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.goalFoot}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {formatMinutes(today.focusMinutes)} / {workHours}h
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{plural(today.sessions, 'session')}</Text>
            </View>
          </>
        ) : null}
      </Card>

      <Text style={[styles.section, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.actions}>
        <QuickAction icon="shield-checkmark" label="Start Focus" onPress={startFocus} testID="quick-start-focus" />
        <QuickAction icon="school" label="Work Setup" onPress={() => navigation.navigate('WorkSetup')} />
      </View>

      <View style={[styles.quote, { backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.quoteText, { color: colors.text }]}>“{quoteOfTheDay()}”</Text>
        <LeafCorner side="right" size={90} style={{ bottom: -6, right: -6 }} />
      </View>
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13.5 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 },
  hello: { fontSize: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 30, fontWeight: '800' },
  motto: { fontSize: 12.5, marginTop: 2 },
  gear: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    marginTop: 18,
  },
  goalCard: { marginTop: 20, gap: 14 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  goalIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  goalLabel: { fontSize: 13 },
  goalValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  goalFoot: { flexDirection: 'row', justifyContent: 'space-between' },
  center: { alignItems: 'center', paddingVertical: 8 },
  section: { fontSize: 16, fontWeight: '800', marginTop: 26, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 14 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quote: {
    marginTop: 22,
    marginBottom: 28,
    borderRadius: radius.lg,
    padding: 22,
    minHeight: 96,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quoteText: { fontSize: 15, fontWeight: '600', lineHeight: 22, maxWidth: '80%' },
});
