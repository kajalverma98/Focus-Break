import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../config';
import { useTheme } from '../theme';
import { Sprout } from './Leaf';

interface Props {
  size?: 'sm' | 'lg';
  tagline?: string;
}

export function Logo({ size = 'sm', tagline }: Props) {
  const { colors } = useTheme();
  const big = size === 'lg';
  return (
    <View style={styles.wrap}>
      <Sprout size={big ? 52 : 36} />
      <Text style={[styles.name, { color: colors.primary, fontSize: big ? 32 : 24 }]}>{APP_NAME}</Text>
      {tagline ? <Text style={[styles.tag, { color: colors.primary }]}>{tagline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  name: { fontWeight: '800', letterSpacing: 0.3 },
  tag: { fontSize: 13, fontWeight: '500' },
});
