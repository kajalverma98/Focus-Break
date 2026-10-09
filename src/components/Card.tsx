import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { cardShadow, radius, useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export function Card({ children, style, padding = 16 }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding,
        },
        cardShadow(colors),
        style,
      ]}
    >
      {children}
    </View>
  );
}
