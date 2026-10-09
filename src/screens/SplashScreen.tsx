import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HeroArt } from '../components/HeroArt';
import { Logo } from '../components/Logo';
import { PageDots } from '../components/PageDots';
import { Screen } from '../components/Screen';
import { APP_TAGLINE } from '../config';
import { useTheme } from '../theme';

export default function SplashScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.top}>
        <Logo size="lg" tagline={APP_TAGLINE} />
      </View>
      <View style={styles.middle}>
        <HeroArt icon="laptop-outline" badge="cafe-outline" size={240} />
      </View>
      <View style={styles.bottom}>
        <Text style={[styles.caption, { color: colors.text }]}>Small breaks. Big changes.</Text>
        <PageDots count={3} index={0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1.1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 12 },
  middle: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  bottom: { flex: 0.9, alignItems: 'center', justifyContent: 'flex-start', gap: 18 },
  caption: { fontSize: 15, fontWeight: '500' },
});
