import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Option } from '../constants/options';
import { radius, useTheme } from '../theme';

interface Props<T extends string | number> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  title: string;
  error?: string;
}

/** Dropdown that opens a bottom sheet list – consistent look on iOS and Android. */
export function SelectField<T extends string | number>({ value, options, onChange, title, error }: Props<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${selected?.label ?? 'select'}`}
        style={[
          styles.box,
          { backgroundColor: colors.inputBg, borderColor: error ? colors.danger : colors.border },
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>{selected?.label ?? 'Select'}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => undefined}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.value)}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[styles.option, active && { backgroundColor: colors.primarySoft }]}
                  >
                    <Text
                      style={{
                        color: active ? colors.primary : colors.text,
                        fontWeight: active ? '700' : '500',
                        fontSize: 16,
                      }}
                    >
                      {item.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: { fontSize: 15, fontWeight: '500' },
  error: { fontSize: 12.5, marginTop: 4, marginLeft: 2 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, paddingBottom: 32 },
  sheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
});
