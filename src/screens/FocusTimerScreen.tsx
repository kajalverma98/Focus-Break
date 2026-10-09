import React, { useEffect, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useToast } from '../components/Toast';
import { useCountdown } from '../hooks/useCountdown';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/types';
import { pauseAmbient, playAmbient, stopAmbient } from '../services/ambient';
import { cancelSessionEnd, scheduleSessionEnd } from '../services/notifications';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addDistraction, pause, prepareFocus, resume } from '../store/slices/timerSlice';
import { abandonPhase, beginFocus, completeFocus } from '../store/thunks';
import { radius } from '../theme';
import { firstName, formatClock } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'FocusTimer'>;
const KEEP_AWAKE_TAG = 'focus-session';

export const SKY = ['#1B3556', '#3B5B8C', '#B27A6C', '#E9A767', '#4E7B5E'] as const;

export default function FocusTimerScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const haptics = useHaptics();
  const timer = useAppSelector((s) => s.timer);
  const settings = useAppSelector((s) => s.settings);
  const user = useAppSelector((s) => s.auth.user);
  const allowLeave = useRef(false);

  const focusing = timer.phase === 'focus';
  const running = focusing && timer.running;

  // Entry: decide whether to resume, auto-start, or show an idle (ready) ring.
  useEffect(() => {
    if (timer.phase === 'break') {
      allowLeave.current = true;
      navigation.replace('BreakActivity');
      return;
    }
    if (timer.phase === 'focusDone') {
      allowLeave.current = true;
      navigation.replace('SessionComplete');
      return;
    }
    if (timer.phase === 'focus') return; // already running / paused: just show it
    if (route.params?.autoStart) dispatch(beginFocus());
    else dispatch(prepareFocus({ minutes: settings.focusMinutes }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingMs = useCountdown({
    running,
    endAt: timer.endAt,
    remainingMs: timer.remainingMs,
    onComplete: () => {
      dispatch(completeFocus()).then(() => {
        haptics.success();
        allowLeave.current = true;
        navigation.replace('SessionComplete');
      });
    },
  });

  // Keep the screen on and play ambient sound only while actively focusing.
  useEffect(() => {
    if (running) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
      if (settings.soundId !== 'none') playAmbient(settings.soundId);
      else stopAmbient();
    } else {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
      pauseAmbient();
    }
  }, [running, settings.soundId]);

  useEffect(
    () => () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
      stopAmbient();
    },
    [],
  );

  // Confirm before abandoning a live session (header arrow, Android back, iOS swipe).
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (allowLeave.current || timer.phase !== 'focus') return;
      e.preventDefault();
      Alert.alert('End this session?', 'Your progress for this session will not be saved.', [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'End session',
          style: 'destructive',
          onPress: async () => {
            allowLeave.current = true;
            await dispatch(abandonPhase());
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
  }, [navigation, timer.phase, dispatch]);

  const totalMs = timer.totalMs || settings.focusMinutes * 60000;
  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;
  const displayMs = !focusing && timer.remainingMs === 0 ? settings.focusMinutes * 60000 : remainingMs;

  const onPrimary = () => {
    haptics.tap();
    if (!focusing) {
      dispatch(beginFocus());
    } else if (timer.running) {
      dispatch(pause({ now: Date.now() }));
      cancelSessionEnd();
    } else {
      dispatch(resume({ now: Date.now() }));
      scheduleSessionEnd('focus', timer.remainingMs / 1000);
    }
  };

  const onDistracted = () => {
    haptics.warning();
    dispatch(addDistraction());
    toast.show('Noted. Take a breath and refocus.', 'info');
  };

  const primaryLabel = !focusing ? 'Start' : timer.running ? 'Pause' : 'Resume';
  const primaryIcon = !focusing || !timer.running ? 'play' : 'pause';

  return (
    <Screen
      lightStatusBar
      background={<LinearGradient colors={SKY} locations={[0, 0.35, 0.62, 0.8, 1]} style={StyleSheet.absoluteFill} />}
    >
      <ScreenHeader
        title="Focus Mode"
        light
        right={
          <Pressable onPress={() => navigation.navigate('Sounds')} hitSlop={12} accessibilityLabel="Choose ambient sound">
            <Ionicons name={settings.soundId === 'none' ? 'musical-notes-outline' : 'musical-notes'} size={22} color="#FFFFFF" />
          </Pressable>
        }
      />

      <View style={styles.intro}>
        <Text style={styles.hello}>You got this, {firstName(user?.name)}!</Text>
        <Text style={styles.sub}>Stay focused, you're doing great.</Text>
      </View>

      <View style={styles.ringWrap}>
        <ProgressRing
          size={250}
          stroke={12}
          progress={focusing ? progress : 0}
          color="#FFF3D6"
          trackColor="rgba(255,255,255,0.28)"
        >
          <Text style={styles.time} accessibilityLabel={`${formatClock(displayMs / 1000)} remaining`}>
            {formatClock(displayMs / 1000)}
          </Text>
          <Text style={styles.timeLabel}>Focus Time</Text>
        </ProgressRing>
      </View>

      <View style={styles.bottom}>
        <View style={styles.sessionCard}>
          <View style={styles.sessionIcon}>
            <Ionicons name="leaf" size={20} color="#177A57" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>Focus Session</Text>
            <Text style={styles.sessionSub}>
              {settings.focusMinutes} minutes • {settings.breakMinutes} minute break
              {timer.completedSessions > 0 ? `  •  ${timer.completedSessions} done` : ''}
            </Text>
          </View>
          {!focusing ? (
            <Pressable onPress={() => navigation.navigate('WorkSetup')} hitSlop={10} accessibilityLabel="Change durations">
              <Ionicons name="chevron-forward" size={20} color="#5B6B66" />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.buttons}>
          <Pressable
            onPress={onPrimary}
            accessibilityRole="button"
            testID="focus-primary"
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name={primaryIcon} size={18} color="#1D2B27" />
            <Text style={styles.btnPrimaryText}>{primaryLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onDistracted}
            disabled={!running}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.btn,
              styles.btnDanger,
              (!running || pressed) && { opacity: running ? 0.85 : 0.5 },
            ]}
          >
            <Ionicons name="warning-outline" size={18} color="#E5484D" />
            <Text style={styles.btnDangerText}>
              I got distracted{timer.distractions > 0 ? ` (${timer.distractions})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', marginTop: 16, gap: 6 },
  hello: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5 },
  ringWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  time: { color: '#FFFFFF', fontSize: 54, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timeLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  bottom: { gap: 14, paddingBottom: 12 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  sessionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E3F3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitle: { color: '#1D2B27', fontSize: 14.5, fontWeight: '700' },
  sessionSub: { color: '#5B6B66', fontSize: 12, marginTop: 2 },
  buttons: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimary: { backgroundColor: 'rgba(255,255,255,0.94)' },
  btnPrimaryText: { color: '#1D2B27', fontWeight: '700', fontSize: 14.5 },
  btnDanger: { backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 1.5, borderColor: '#F3B4B6' },
  btnDangerText: { color: '#E5484D', fontWeight: '700', fontSize: 13.5 },
});
