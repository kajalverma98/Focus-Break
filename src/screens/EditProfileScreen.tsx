import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { useUpdateProfileMutation } from '../api/api';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { FormTextField } from '../components/TextField';
import { useToast } from '../components/Toast';
import type { StackNavigation } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUser } from '../store/slices/authSlice';
import { useTheme } from '../theme';
import { getErrorMessage, initial } from '../utils/format';
import { editProfileSchema, type EditProfileForm } from '../utils/validation';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const user = useAppSelector((s) => s.auth.user);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { control, handleSubmit } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: user?.name ?? '', tagline: user?.tagline ?? '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await updateProfile({ name: values.fullName, tagline: values.tagline }).unwrap();
      dispatch(updateUser(updated));
      toast.show('Profile updated', 'success');
      navigation.goBack();
    } catch (e) {
      toast.show(getErrorMessage(e), 'error');
    }
  });

  return (
    <Screen scroll>
      <ScreenHeader title="Edit Profile" />
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: colors.text }]}>
          <Text style={{ color: colors.background, fontSize: 34, fontWeight: '800' }}>{initial(user?.name)}</Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 10 }}>{user?.identifier}</Text>
      </View>
      <View style={styles.form}>
        <FormTextField control={control} name="fullName" icon="person-outline" placeholder="Full Name" autoCapitalize="words" />
        <FormTextField control={control} name="tagline" icon="chatbubble-ellipses-outline" placeholder="Your motto (optional)" autoCapitalize="sentences" />
        <Button title="Save changes" onPress={onSubmit} loading={isLoading} testID="profile-save" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginTop: 20 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 14, marginTop: 28 },
});
