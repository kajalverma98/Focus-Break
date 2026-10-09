import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size: number;
  stroke: number;
  /** 0..1 */
  progress: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}

export function ProgressRing({ size, stroke, progress, color, trackColor, children }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const mid = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={mid} cy={mid} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={mid}
          cy={mid}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          rotation={-90}
          originX={mid}
          originY={mid}
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
