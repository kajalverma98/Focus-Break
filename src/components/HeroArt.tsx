import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconName } from '../constants/activities';
import { useTheme } from '../theme';
import { LeafCorner } from './Leaf';

interface Props {
  icon: IconName;
  /** secondary badge icon */
  badge?: IconName;
  size?: number;
}

/**
 * Lightweight illustration: soft blobs + an icon + leaves. It stands in for the
 * artwork in the design, which can be swapped for real images later.
 */
export function HeroArt({ icon, badge, size = 220 }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size * 1.4, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.blob,
          { width: size * 0.95, height: size * 0.95, borderRadius: size, backgroundColor: colors.primarySoft },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: size,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.leafB,
          },
        ]}
      />
      <Ionicons name={icon} size={size * 0.34} color={colors.primary} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.warningSoft, top: size * 0.08, right: size * 0.18 }]}>
          <Ionicons name={badge} size={size * 0.14} color={colors.warning} />
        </View>
      ) : null}
      <LeafCorner side="left" size={size * 0.5} style={{ bottom: -4, left: 0 }} />
      <LeafCorner side="right" size={size * 0.5} style={{ bottom: -4, right: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute' },
  badge: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
