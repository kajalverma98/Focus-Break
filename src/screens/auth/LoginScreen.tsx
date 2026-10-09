import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../../api/api';
import { Button } from '../../components/Button';
import { LeafCorner } from '../../components/Leaf';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { FormTextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { DEMO_CREDENTIALS } from '../../config';
import type { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { useTheme } from '../../theme';
import { getErrorMessage } from '../../utils/format';
import { loginSchema, normalizeIdentifier, type LoginForm } from '../../utils/validation';

export default function LoginScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const { control, handleSubmit, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await login({
        identifier: normalizeIdentifier(values.identifier),
        password: values.password,
      }).unwrap();
      dispatch(setCredentials(res));
      toast.show(`Welcome back, ${res.user.name.split(' ')[0]}!`, 'success');
    } catch (e) {
      toast.show(getErrorMessage(e), 'error');
    }
  });

  const useDemo = () => {
    setValue('identifier', DEMO_CREDENTIALS.identifier, { shouldValidate: true });
    setValue('password', DEMO_CREDENTIALS.password, { shouldValidate: true });
  };

  return (
    <Screen scroll>
      <View style={styles.logo}>
        <Logo />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Welcome back!</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Log in to continue your journey</Text>

      <View style={styles.form}>
        <FormTextField
          control={control}
          name="identifier"
          icon="mail-outline"
          placeholder="Email or Mobile Number"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
        />
        <FormTextField
          control={control}
          name="password"
          icon="lock-closed-outline"
          placeholder="Password"
          secure
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Button title="Login" onPress={onSubmit} loading={isLoading} testID="login-submit" />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8} style={styles.center}>
          <Text style={[styles.link, { color: colors.primary }]}>Forgot Password?</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Button title="Create Account" variant="outline" onPress={() => navigation.navigate('Register')} />

        <Pressable onPress={useDemo} hitSlop={8} style={styles.center}>
          <Text style={{ color: colors.textMuted, fontSize: 12.5 }}>
            Demo account: <Text style={{ color: colors.primary, fontWeight: '700' }}>fill credentials</Text>
          </Text>
        </Pressable>
      </View>
      <LeafCorner side="left" />
      <LeafCorner side="right" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 28 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 28 },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  form: { gap: 14, marginTop: 28, paddingBottom: 120 },
  center: { alignItems: 'center', paddingVertical: 4 },
  link: { fontSize: 13.5, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 2 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
});
