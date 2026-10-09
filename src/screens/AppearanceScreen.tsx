import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import type { IconName } from '../constants/activities';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setThemeMode } from '../store/slices/themeSlice';
import type { ThemeMode } from '../types';

const OPTIONS: { value: ThemeMode; title: string; subtitle: string; icon: IconName }[] = [
  { value: 'light', title: 'Light', subtitle: 'Bright and fresh', icon: 'sunny-outline' },
  { value: 'dark', title: 'Dark', subtitle: 'Easy on the eyes at night', icon: 'moon-outline' },
  { value: 'system', title: 'System default', subtitle: 'Match your phone setting', icon: 'phone-portrait-outline' },
];

export default function AppearanceScreen() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  return (
    <Screen scroll>
      <ScreenHeader title="Appearance" />
      <Card style={styles.card} padding={0}>
        {OPTIONS.map((o, i) => (
          <ListRow
            key={o.value}
            icon={o.icon}
            title={o.title}
            subtitle={o.subtitle}
            selected={mode === o.value}
            onPress={() => dispatch(setThemeMode(o.value))}
            last={i === OPTIONS.length - 1}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ card: { marginTop: 16, paddingHorizontal: 18 } });
