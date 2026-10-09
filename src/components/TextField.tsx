import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { IconName } from '../constants/activities';
import { radius, useTheme } from '../theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  icon: IconName;
  error?: string;
  /** Password field with a show/hide toggle */
  secure?: boolean;
}

export function TextField({ icon, error, secure, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrap}>
      <View style={[styles.box, { backgroundColor: colors.inputBg, borderColor }]}>
        <Ionicons name={icon} size={18} color={error ? colors.danger : colors.textMuted} />
        <TextInput
          {...rest}
          secureTextEntry={secure ? hidden : false}
          placeholderTextColor={colors.textMuted}
          autoCapitalize={rest.autoCapitalize ?? 'none'}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.text }]}
          accessibilityLabel={rest.placeholder}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="Toggle password visibility">
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

interface FormProps<T extends FieldValues> extends TextFieldProps {
  control: Control<T>;
  name: Path<T>;
}

/** TextField wired to react-hook-form. */
export function FormTextField<T extends FieldValues>({ control, name, ...rest }: FormProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          {...rest}
          value={(value as string) ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, height: '100%' },
  error: { fontSize: 12.5, marginLeft: 4 },
});
