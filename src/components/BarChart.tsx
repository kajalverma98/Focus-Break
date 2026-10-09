import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { TrendPoint } from '../utils/stats';

interface Props {
  data: TrendPoint[];
  height?: number;
  /** highlight the bar at this index */
  highlightIndex?: number;
}

export function BarChart({ data, height = 120, highlightIndex }: Props) {
  const { colors } = useTheme();
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60);
  // Round the axis up to a whole number of hours, in steps that divide evenly into 3 ticks.
  const maxHours = Math.max(2, Math.ceil(maxMinutes / 60 / 2) * 2);
  const ticks = [maxHours, (maxHours * 2) / 3, maxHours / 3, 0].map((h) => Math.round(h * 10) / 10);

  return (
    <View style={styles.wrap}>
      <View style={[styles.axis, { height }]}>
        {ticks.map((t, i) => (
          <Text key={i} style={[styles.tick, { color: colors.textMuted }]}>
            {t}h
          </Text>
        ))}
      </View>
      <View style={styles.plot}>
        <View style={[styles.bars, { height }]}>
          {ticks.map((_, i) => (
            <View
              key={i}
              style={[styles.gridLine, { top: (height / 3) * i, backgroundColor: colors.border }]}
            />
          ))}
          {data.map((d, i) => {
            const h = Math.max(d.minutes > 0 ? 6 : 3, (d.minutes / 60 / maxHours) * height);
            const active = highlightIndex === i;
            return (
              <View key={d.label} style={styles.barSlot}>
                <View
                  style={{
                    height: h,
                    width: 14,
                    borderRadius: 7,
                    backgroundColor: d.minutes > 0 ? (active ? colors.primary : colors.leafA) : colors.border,
                  }}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.labels}>
          {data.map((d) => (
            <Text key={d.label} style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
              {d.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  axis: { justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 0 },
  tick: { fontSize: 11 },
  plot: { flex: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  barSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  labels: { flexDirection: 'row', marginTop: 6 },
  label: { flex: 1, textAlign: 'center', fontSize: 11 },
});
