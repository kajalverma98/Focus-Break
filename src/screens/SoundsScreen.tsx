import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SOUNDS } from '../constants/sounds';
import { playAmbient, stopAmbient } from '../services/ambient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSound } from '../store/slices/settingsSlice';
import { useTheme } from '../theme';

export default function SoundsScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const soundId = useAppSelector((s) => s.settings.soundId);
  const focusRunning = useAppSelector((s) => s.timer.phase === 'focus' && s.timer.running);

  // Stop any preview when leaving – unless a live focus session owns the audio.
  useEffect(
    () => () => {
      if (!focusRunning) stopAmbient();
    },
    [focusRunning],
  );

  const choose = (id: string) => {
    dispatch(setSound(id));
    // During a live session the Focus screen starts the new sound itself; otherwise preview it.
    if (!focusRunning) playAmbient(id);
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Sounds" />
      <Text style={[styles.note, { color: colors.textMuted }]}>
        Ambient sound plays while you focus. Tap one to preview it.
      </Text>
      <Card style={styles.card} padding={0}>
        {SOUNDS.map((s, i) => (
          <ListRow
            key={s.id}
            icon={s.icon}
            title={s.title}
            subtitle={s.subtitle}
            selected={soundId === s.id}
            onPress={() => choose(s.id)}
            last={i === SOUNDS.length - 1}
          />
        ))}
      </Card>
      <Text style={[styles.foot, { color: colors.textMuted }]}>
        The bundled sounds are simple placeholders. Replace the files in assets/sounds with your own recordings.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13.5, marginTop: 14 },
  card: { marginTop: 14, paddingHorizontal: 18 },
  foot: { fontSize: 12, marginTop: 16, lineHeight: 18 },
});
