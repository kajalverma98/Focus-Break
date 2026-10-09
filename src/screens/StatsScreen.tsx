import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetSessionsQuery } from '../api/api';
import { BarChart } from '../components/BarChart';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { SegmentedTabs } from '../components/SegmentedTabs';
import type { IconName } from '../constants/activities';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setRange } from '../store/slices/statsSlice';
import { radius, useTheme } from '../theme';
import type { StatsRange } from '../types';
import { formatMinutes } from '../utils/format';
import { computeStreaks, goalPercent, monthTrend, summarize, weekTrend } from '../utils/stats';

const RANGES: { label: string; value: StatsRange }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export default function StatsScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const range = useAppSelector((s) => s.stats.range);
  const workHours = useAppSelector((s) => s.settings.workHours);
  const { data, isLoading, isFetching, isError, refetch } = useGetSessionsQuery();

  const sessions = data ?? [];
  const now = new Date();
  const summary = summarize(sessions, range, now);
  const pct = goalPercent(summary.focusMinutes, workHours, range, now);
  const streaks = computeStreaks(sessions, now);
  const trend = range === 'month' ? monthTrend(sessions, now) : weekTrend(sessions, now);
  const todayIndex = range === 'month' ? 3 : (now.getDay() + 6) % 7;
  const isEmpty = !isLoading && sessions.length === 0;

  return (
    <Screen
      scroll
      edges={['top']}
      refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Text style={[styles.title, { color: colors.text }]}>Your Progress</Text>
      <SegmentedTabs value={range} options={RANGES} onChange={(r) => dispatch(setRange(r))} />

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginVertical: 12 }}>Couldn't load your stats.</Text>
          <Button title="Try again" variant="outline" onPress={refetch} />
        </View>
      ) : (
        <>
          {isEmpty ? (
            <View style={[styles.empty, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="leaf-outline" size={22} color={colors.primary} />
              <Text style={{ color: colors.text, flex: 1, fontSize: 13.5 }}>
                No sessions yet. Complete a focus session and your stats will appear here.
              </Text>
            </View>
          ) : null}

          <View style={styles.tiles}>
            <Tile icon="timer-outline" label="Focus Time" value={formatMinutes(summary.focusMinutes)} />
            <Tile icon="checkmark-done-outline" label="Sessions" value={String(summary.sessions)} />
            <Tile icon="cafe-outline" label="Breaks" value={String(summary.breaks)} />
          </View>

          <View style={styles.pair}>
            <Card style={styles.pairCard}>
              <ProgressRing size={118} stroke={11} progress={pct / 100} color={colors.primary} trackColor={colors.primarySoft}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{pct}%</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>Goal Complete</Text>
              </ProgressRing>
            </Card>
            <Card style={[styles.pairCard, { alignItems: 'flex-start', justifyContent: 'center' }]}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Focus Streak</Text>
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={26} color={colors.warning} />
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
                  {streaks.current} {streaks.current === 1 ? 'day' : 'days'}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 11.5, marginTop: 6 }}>
                Longest: {streaks.longest} days
              </Text>
            </Card>
          </View>

          <Text style={[styles.section, { color: colors.text }]}>Focus Trend</Text>
          <Card>
            <BarChart data={trend} highlightIndex={todayIndex} />
          </Card>
          <Text style={[styles.foot, { color: colors.textMuted }]}>
            {summary.distractions > 0
              ? `${summary.distractions} distraction${summary.distractions === 1 ? '' : 's'} logged ${range === 'today' ? 'today' : range === 'week' ? 'this week' : 'this month'}.`
              : 'No distractions logged. Nice focus!'}
          </Text>
        </>
      )}
    </Screen>
  );
}

function Tile({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.tileHead}>
        <Ionicons name={icon} size={14} color={colors.primary} />
        <Text style={{ color: colors.textMuted, fontSize: 11 }} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 6 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginVertical: 14 },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  empty: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: radius.md, marginTop: 16 },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tile: { flex: 1, padding: 12, borderRadius: radius.md, borderWidth: 1 },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pair: { flexDirection: 'row', gap: 12, marginTop: 14 },
  pairCard: { flex: 1, alignItems: 'center', minHeight: 150, justifyContent: 'center' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  section: { fontSize: 16, fontWeight: '800', marginTop: 22, marginBottom: 12 },
  foot: { fontSize: 12.5, textAlign: 'center', marginTop: 14, marginBottom: 28 },
});
