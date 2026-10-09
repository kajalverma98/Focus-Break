import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

export function PageDots({ count, index }: { count: number; index: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index
              ? { width: 18, backgroundColor: colors.primary }
              : { width: 6, backgroundColor: colors.leafB },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 6, borderRadius: 3 },
});
