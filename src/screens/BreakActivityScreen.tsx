import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeroArt } from '../components/HeroArt';
import { PageDots } from '../components/PageDots';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { getActivity, pickActivity } from '../constants/activities';
import { useCountdown } from '../hooks/useCountdown';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActivity } from '../store/slices/timerSlice';
import { abandonPhase, beginFocus, completeBreak } from '../store/thunks';
import { radius, useTheme } from '../theme';
import { formatClock } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'BreakActivity'>;

export default function BreakActivityScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const haptics = useHaptics();
  const timer = useAppSelector((s) => s.timer);
  const autoStartNext = useAppSelector((s) => s.settings.autoStartNext);
  const leaving = useRef(false);

  const activity = getActivity(timer.activityId);
  const onBreak = timer.phase === 'break';

  // If someone lands here with no break running, bounce back.
  useEffect(() => {
    if (!onBreak && !leaving.current) navigation.replace('MainTabs');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToNextFocus = (start: boolean) => {
    leaving.current = true;
    if (start) dispatch(beginFocus());
    navigation.replace('FocusTimer', { autoStart: false });
  };

  const remainingMs = useCountdown({
    running: onBreak && timer.running,
    endAt: timer.endAt,
    remainingMs: timer.remainingMs,
    onComplete: () => {
      dispatch(completeBreak()).then(() => {
        haptics.success();
        if (autoStartNext) goToNextFocus(true);
        else {
          leaving.current = true;
          navigation.replace('FocusTimer', { autoStart: false });
        }
      });
    },
  });

  const anotherActivity = () => {
    haptics.tap();
    dispatch(setActivity(pickActivity(timer.activityId).id));
  };

  const backToWork = async () => {
    haptics.tap();
    // Count the break only if at least half of it was taken.
    if (remainingMs <= timer.totalMs / 2) await dispatch(completeBreak());
    else await dispatch(abandonPhase());
    goToNextFocus(true);
  };

  const onBack = () => {
    Alert.alert('End break early?', 'You can go back to work now, or keep resting.', [
      { text: 'Keep resting', style: 'cancel' },
      { text: 'Back to work', onPress: backToWork },
    ]);
  };

  return (
    <Screen scroll>
      <ScreenHeader onBack={onBack} />
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.text }]}>{activity.heading}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{activity.subheading}</Text>
        {timer.isLongBreak ? (
          <View style={[styles.longTag, { backgroundColor: colors.warningSoft }]}>
            <Text style={{ color: colors.warning, fontWeight: '700', fontSize: 12 }}>Long break – you earned it!</Text>
          </View>
        ) : null}
      </View>

      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.warningSoft }]}>
            <Ionicons name={activity.icon} size={30} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actTitle, { color: colors.text }]}>{activity.title}</Text>
            <Text style={[styles.actDesc, { color: colors.textMuted }]}>{activity.description}</Text>
          </View>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.primary }]}>
          <Ionicons name="time-outline" size={14} color={colors.onPrimary} />
          <Text style={[styles.pillText, { color: colors.onPrimary }]} testID="break-timer">
            {formatClock(remainingMs / 1000)}
          </Text>
        </View>
      </Card>

      <View style={styles.dots}>
        <PageDots count={3} index={1} />
      </View>

      <View style={styles.art}>
        <HeroArt icon={activity.icon} size={200} />
      </View>

      <View style={styles.footer}>
        <Button title="Get Another Activity" variant="outline" icon="refresh" onPress={anotherActivity} />
        <Button title="Back to Work" onPress={backToWork} testID="break-back-to-work" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginTop: 12, gap: 6 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 13.5, textAlign: 'center' },
  longTag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, marginTop: 6 },
  card: { marginTop: 26, gap: 16 },
  cardRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  iconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 16, fontWeight: '800' },
  actDesc: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginLeft: 74,
  },
  pillText: { fontWeight: '800', fontSize: 14, fontVariant: ['tabular-nums'] },
  dots: { marginTop: 16 },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 180 },
  footer: { gap: 12, paddingBottom: 20 },
});
