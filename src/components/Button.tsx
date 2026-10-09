import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconName } from '../constants/activities';
import { radius, useTheme } from '../theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'glass';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  /** icon placed after the label (e.g. an arrow) */
  trailingIcon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  trailingIcon,
  style,
  testID,
}: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const palette = {
    primary: { bg: colors.primary, border: colors.primary, fg: colors.onPrimary },
    outline: { bg: 'transparent', border: colors.primary, fg: colors.primary },
    ghost: { bg: 'transparent', border: 'transparent', fg: colors.primary },
    danger: { bg: 'transparent', border: colors.danger, fg: colors.danger },
    glass: { bg: 'rgba(255,255,255,0.22)', border: 'rgba(255,255,255,0.35)', fg: '#FFFFFF' },
  }[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: inactive ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
          <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
          {trailingIcon ? <Ionicons name={trailingIcon} size={18} color={palette.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: '700' },
});
