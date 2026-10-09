import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useTheme } from '../theme';

/** The sprout used as the app mark. */
export function Sprout({ size = 40, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  const c = color ?? colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 21 V11" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M12 20 C12 14.5 8.2 11.2 3 11.2 C3 16.6 6.9 20 12 20 Z" fill={c} />
      <Path d="M12 14 C12 8.2 15.3 5 21 5 C21 10.8 17.3 14 12 14 Z" fill={c} opacity={0.85} />
    </Svg>
  );
}

const LEAF = 'M0 0 C8 -13 26 -13 36 0 C26 13 8 13 0 0 Z';

interface LeafSpec {
  x: number;
  y: number;
  rot: number;
  scale: number;
  tone: 'A' | 'B';
}

const CORNER: LeafSpec[] = [
  { x: 10, y: 110, rot: -80, scale: 1.7, tone: 'A' },
  { x: 14, y: 96, rot: -55, scale: 1.4, tone: 'B' },
  { x: 30, y: 112, rot: -105, scale: 1.3, tone: 'B' },
  { x: 44, y: 100, rot: -30, scale: 1.0, tone: 'A' },
  { x: 6, y: 80, rot: -95, scale: 1.0, tone: 'A' },
];

/** Decorative leaves tucked into a screen corner. */
export function LeafCorner({
  side = 'left',
  size = 120,
  style,
}: {
  side?: 'left' | 'right';
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', bottom: 0, [side]: 0, width: size, height: size },
        side === 'right' ? { transform: [{ scaleX: -1 }] } : null,
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {CORNER.map((l, i) => (
          <G key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.scale})`}>
            <Path d={LEAF} fill={l.tone === 'A' ? colors.leafA : colors.leafB} opacity={0.9} />
          </G>
        ))}
      </Svg>
    </View>
  );
}
