import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconName } from '../constants/activities';
import { useTheme } from '../theme';

interface Props {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  /** renders a switch instead of a chevron */
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
  /** radio-style check on the right */
  selected?: boolean;
  danger?: boolean;
  last?: boolean;
}

export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  switchValue,
  onSwitchChange,
  selected,
  danger,
  last,
}: Props) {
  const { colors } = useTheme();
  const tint = danger ? colors.danger : colors.primary;
  const isSwitch = switchValue !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
        pressed && onPress ? { opacity: 0.7 } : null,
      ]}
    >
      <Ionicons name={icon} size={22} color={tint} style={styles.icon} />
      <View style={styles.texts}>
        <Text style={[styles.title, { color: danger ? colors.danger : colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
        />
      ) : selected !== undefined ? (
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={selected ? colors.primary : colors.textMuted}
        />
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 },
  icon: { width: 26, textAlign: 'center' },
  texts: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12.5, marginTop: 2 },
});
