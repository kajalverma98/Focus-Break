import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetSessionsQuery } from '../api/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { radius, useTheme } from '../theme';
import { computeStreaks, dayKey } from '../utils/stats';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function StreakScreen() {
  const { colors } = useTheme();
  const { data, isLoading, isFetching, isError, refetch } = useGetSessionsQuery();
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const streaks = useMemo(() => computeStreaks(data ?? [], new Date()), [data]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const activeThisMonth = cells.filter((d) => d && streaks.activeDays.has(dayKey(new Date(year, month, d)))).length;

  const shift = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <Screen
      scroll
      edges={['top']}
      refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Text style={[styles.title, { color: colors.text }]}>Your Streak</Text>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginVertical: 12 }}>Couldn't load your streak.</Text>
          <Button title="Try again" variant="outline" onPress={refetch} />
        </View>
      ) : (
        <>
          <View style={styles.hero}>
            <View style={[styles.flame, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="flame" size={54} color={colors.warning} />
            </View>
            <Text style={[styles.big, { color: colors.text }]}>
              {streaks.current} {streaks.current === 1 ? 'day' : 'days'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13.5 }}>
              {streaks.current === 0 ? 'Complete a focus session to start your streak' : 'Current streak – keep it going!'}
            </Text>
          </View>

          <View style={styles.pair}>
            <Card style={styles.pairCard}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Longest streak</Text>
              <Text style={[styles.pairValue, { color: colors.text }]}>{streaks.longest} days</Text>
            </Card>
            <Card style={styles.pairCard}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Active this month</Text>
              <Text style={[styles.pairValue, { color: colors.text }]}>{activeThisMonth} days</Text>
            </Card>
          </View>

          <Card style={{ marginTop: 16 }}>
            <View style={styles.monthRow}>
              <Pressable onPress={() => shift(-1)} hitSlop={12} accessibilityLabel="Previous month">
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>
                {MONTHS[month]} {year}
              </Text>
              <Pressable
                onPress={() => shift(1)}
                disabled={isCurrentMonth}
                hitSlop={12}
                accessibilityLabel="Next month"
                style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
              >
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.grid}>
              {WEEKDAYS.map((w, i) => (
                <View key={`w${i}`} style={styles.cell}>
                  <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>{w}</Text>
                </View>
              ))}
              {cells.map((d, i) => {
                if (!d) return <View key={`e${i}`} style={styles.cell} />;
                const date = new Date(year, month, d);
                const active = streaks.activeDays.has(dayKey(date));
                const isToday = dayKey(date) === dayKey(today);
                const future = date.getTime() > today.getTime() && !isToday;
                return (
                  <View key={d} style={styles.cell}>
                    <View
                      style={[
                        styles.day,
                        active && { backgroundColor: colors.primary },
                        isToday && { borderWidth: 2, borderColor: colors.warning },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12.5,
                          fontWeight: active || isToday ? '800' : '500',
                          color: active ? colors.onPrimary : future ? colors.border : colors.text,
                        }}
                      >
                        {d}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Focused day</Text>
              <View style={[styles.dot, { borderWidth: 2, borderColor: colors.warning, marginLeft: 14 }]} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Today</Text>
            </View>
          </Card>
          <View style={{ height: 28 }} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginVertical: 14 },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  hero: { alignItems: 'center', gap: 6, marginTop: 8 },
  flame: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  big: { fontSize: 34, fontWeight: '800', marginTop: 8 },
  pair: { flexDirection: 'row', gap: 12, marginTop: 22 },
  pairCard: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  pairValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: '84%', aspectRatio: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
