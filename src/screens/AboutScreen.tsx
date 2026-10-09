import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { APP_TAGLINE } from '../config';
import { useTheme } from '../theme';

export default function AboutScreen() {
  const { colors } = useTheme();
  return (
    <Screen scroll>
      <ScreenHeader title="About" />
      <View style={styles.logo}>
        <Logo size="lg" tagline={APP_TAGLINE} />
        <Text style={{ color: colors.textMuted, marginTop: 10 }}>
          Version {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
      <Card style={{ marginTop: 28 }}>
        <Text style={[styles.body, { color: colors.text }]}>
          Focus & Break helps you work in focused sprints and rest in healthy breaks. Work for a set time, take a short
          break with a simple activity, and build a streak of better habits.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 36 },
  body: { fontSize: 14.5, lineHeight: 22 },
});
