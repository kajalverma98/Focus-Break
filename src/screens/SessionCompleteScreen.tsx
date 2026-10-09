import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetTimer } from '../store/slices/timerSlice';
import { beginBreak, beginFocus } from '../store/thunks';
import { useTheme } from '../theme';
import { firstName, formatMinutes } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export default function SessionCompleteScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const timer = useAppSelector((s) => s.timer);
  const settings = useAppSelector((s) => s.settings);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (timer.phase !== 'focusDone') navigation.replace('MainTabs');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const longDue = timer.completedSessions >= settings.sessionsBeforeLongBreak;
  const breakMinutes = longDue ? settings.longBreakMinutes : settings.breakMinutes;
  const cycleDone = longDue ? settings.sessionsBeforeLongBreak : timer.completedSessions;

  const startBreak = async () => {
    await dispatch(beginBreak());
    navigation.replace('BreakActivity');
  };

  const skipBreak = async () => {
    await dispatch(beginFocus());
    navigation.replace('FocusTimer', { autoStart: false });
  };

  const finishForToday = () => {
    dispatch(resetTimer());
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <ProgressRing size={180} stroke={10} progress={1} color={colors.primary} trackColor={colors.primarySoft}>
          <View style={[styles.check, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="checkmark" size={62} color={colors.primary} />
          </View>
        </ProgressRing>
        <Text style={[styles.title, { color: colors.text }]}>Great job, {firstName(user?.name)}!</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          You focused for {formatMinutes(timer.lastFocusMinutes)}.
        </Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.statRow}>
          <Stat label="This cycle" value={`${cycleDone}/${settings.sessionsBeforeLongBreak}`} />
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <Stat label="Distractions" value={String(timer.distractions)} />
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <Stat label="Next break" value={`${breakMinutes}m`} />
        </View>
        <Text style={[styles.note, { color: colors.textMuted }]}>
          {longDue
            ? "You've finished a full cycle. Time for a longer break!"
            : 'A short break keeps your mind sharp for the next round.'}
        </Text>
      </Card>

      <View style={styles.footer}>
        <Button
          title={longDue ? `Start Long Break (${breakMinutes} min)` : `Start Break (${breakMinutes} min)`}
          onPress={startBreak}
          testID="start-break"
        />
        <Button title="Skip Break" variant="outline" onPress={skipBreak} />
        <Button title="Finish for today" variant="ghost" onPress={finishForToday} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20 }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 40, gap: 10 },
  check: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', marginTop: 18 },
  sub: { fontSize: 15 },
  card: { marginTop: 28, gap: 14 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  sep: { width: StyleSheet.hairlineWidth, height: 36 },
  note: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  footer: { gap: 12, marginTop: 'auto', paddingTop: 28, paddingBottom: 20 },
});
