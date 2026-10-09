import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, useTheme } from '../theme';

interface Props<T extends string> {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}

export function SegmentedTabs<T extends string>({ value, options, onChange }: Props<T>) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: colors.surface, borderColor: colors.primary }]}
          >
            <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: active ? '700' : '500', fontSize: 14 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.pill, borderWidth: 1, padding: 3 },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
