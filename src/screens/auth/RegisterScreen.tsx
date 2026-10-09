import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, useWatch } from 'react-hook-form';
import { useRegisterMutation } from '../../api/api';
import { Button } from '../../components/Button';
import { LeafCorner, Sprout } from '../../components/Leaf';
import { Screen } from '../../components/Screen';
import { FormTextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import type { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { useTheme } from '../../theme';
import { getErrorMessage } from '../../utils/format';
import {
  getPasswordStrength,
  normalizeIdentifier,
  registerSchema,
  type RegisterForm,
} from '../../utils/validation';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [register, { isLoading }] = useRegisterMutation();

  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', identifier: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });
  const password = useWatch({ control, name: 'password' });
  const strength = getPasswordStrength(password ?? '');
  const strengthColor = [colors.border, colors.danger, colors.warning, colors.accent, colors.success][strength.score];

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await register({
        name: values.fullName,
        identifier: normalizeIdentifier(values.identifier),
        password: values.password,
      }).unwrap();
      dispatch(setCredentials(res));
      toast.show('Account created. Welcome aboard!', 'success');
    } catch (e) {
      toast.show(getErrorMessage(e), 'error');
    }
  });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Sprout size={44} />
        <Text style={[styles.title, { color: colors.text }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Join us and build better habits</Text>
      </View>

      <View style={styles.form}>
        <FormTextField
          control={control}
          name="fullName"
          icon="person-outline"
          placeholder="Full Name"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
        />
        <FormTextField
          control={control}
          name="identifier"
          icon="mail-outline"
          placeholder="Email or Mobile Number"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
        />
        <View style={{ gap: 6 }}>
          <FormTextField
            control={control}
            name="password"
            icon="lock-closed-outline"
            placeholder="Password"
            secure
            autoComplete="new-password"
            returnKeyType="next"
          />
          {password ? (
            <View style={styles.strengthRow}>
              <View style={styles.bars}>
                {[1, 2, 3, 4].map((n) => (
                  <View
                    key={n}
                    style={[
                      styles.bar,
                      { backgroundColor: n <= strength.score ? strengthColor : colors.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={{ color: strengthColor, fontSize: 12, fontWeight: '600' }}>{strength.label}</Text>
            </View>
          ) : (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Min 8 characters with uppercase, lowercase and a number
            </Text>
          )}
        </View>
        <FormTextField
          control={control}
          name="confirmPassword"
          icon="lock-closed-outline"
          placeholder="Confirm Password"
          secure
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Button title="Register" onPress={onSubmit} loading={isLoading} testID="register-submit" />

        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8} style={styles.center}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Login</Text>
          </Text>
        </Pressable>
      </View>
      <LeafCorner side="left" />
      <LeafCorner side="right" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 40, gap: 6 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 10 },
  subtitle: { fontSize: 13.5 },
  form: { gap: 14, marginTop: 28, paddingBottom: 120 },
  center: { alignItems: 'center', paddingVertical: 6 },
  hint: { fontSize: 12, marginLeft: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
});
