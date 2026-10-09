import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { useForgotPasswordMutation } from '../../api/api';
import { Button } from '../../components/Button';
import { LeafCorner, Sprout } from '../../components/Leaf';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { FormTextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import type { RootStackParamList } from '../../navigation/types';
import { radius, useTheme } from '../../theme';
import { getErrorMessage } from '../../utils/format';
import {
  forgotPasswordSchema,
  normalizeIdentifier,
  type ForgotPasswordForm,
} from '../../utils/validation';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();
  const [forgot, { isLoading }] = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async ({ identifier }) => {
    try {
      const id = normalizeIdentifier(identifier);
      const res = await forgot({ identifier: id }).unwrap();
      setSentTo(id);
      toast.show(res.message, 'success');
    } catch (e) {
      toast.show(getErrorMessage(e), 'error');
    }
  });

  return (
    <Screen scroll>
      <ScreenHeader />
      <View style={styles.header}>
        <Sprout size={44} />
        <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          No worries! We'll send you a link{'\n'}to reset your password.
        </Text>
      </View>

      <View style={styles.form}>
        {sentTo ? (
          <View style={[styles.sent, { backgroundColor: colors.primarySoft, borderColor: colors.leafB }]}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            <Text style={{ color: colors.text, textAlign: 'center', fontSize: 14, lineHeight: 20 }}>
              Reset link sent to <Text style={{ fontWeight: '700' }}>{sentTo}</Text>.{'\n'}
              Check your inbox and follow the instructions.
            </Text>
          </View>
        ) : (
          <FormTextField
            control={control}
            name="identifier"
            icon="mail-outline"
            placeholder="Email or Mobile Number"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={onSubmit}
          />
        )}
        <Button
          title={sentTo ? 'Resend Link' : 'Send Reset Link'}
          onPress={sentTo ? () => setSentTo(null) : onSubmit}
          loading={isLoading}
          testID="forgot-submit"
        />
        <Button title="Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </View>
      <LeafCorner side="left" />
      <LeafCorner side="right" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 28, gap: 6 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 10 },
  subtitle: { fontSize: 13.5, textAlign: 'center', lineHeight: 20 },
  form: { gap: 14, marginTop: 28, paddingBottom: 120 },
  sent: {
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
});
