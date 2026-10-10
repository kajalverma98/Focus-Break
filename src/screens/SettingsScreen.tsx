import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useGetProfileQuery } from '../api/api';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LeafCorner } from '../components/Leaf';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { getSound } from '../constants/sounds';
import type { TabNavigation } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { performLogout } from '../store/thunks';
import { useTheme } from '../theme';
import { initial } from '../utils/format';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<TabNavigation>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const mode = useAppSelector((s) => s.theme.mode);
  const soundId = useAppSelector((s) => s.settings.soundId);
  // Refreshes the profile from the API (kept in sync by tag invalidation after edits).
  useGetProfileQuery();

  const appearance = mode === 'system' ? 'System default' : mode === 'dark' ? 'Dark mode' : 'Light mode';

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const confirmLogout = () => setConfirmingLogout(true);

  return (
    <Screen scroll padded={false} edges={['top']}>
      <View style={styles.banner}>
        <LinearGradient
          colors={dark ? ['#17312A', '#0E1815'] : ['#CFE8D5', '#FBF7EC']}
          style={StyleSheet.absoluteFill}
        />
        <LeafCorner side="left" size={140} />
        <LeafCorner side="right" size={140} />
      </View>

      <View style={styles.body}>
        <Card style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: colors.text }]}>
            <Text style={{ color: colors.background, fontSize: 22, fontWeight: '800' }}>{initial(user?.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12.5, marginTop: 2 }}>
              {user?.tagline || 'Focus better. Live healthier.'}
            </Text>
          </View>
        </Card>

        <Card style={styles.list} padding={0}>
          <View style={styles.rows}>
            <ListRow icon="person-circle-outline" title="Edit Profile" subtitle={user?.identifier} onPress={() => navigation.navigate('EditProfile')} />
            <ListRow icon="settings-outline" title="Focus & Break Settings" onPress={() => navigation.navigate('WorkSetup')} />
            <ListRow icon="notifications-outline" title="Notifications" onPress={() => navigation.navigate('Notifications')} />
            <ListRow icon="color-palette-outline" title="Appearance" subtitle={`Light / Dark mode • ${appearance}`} onPress={() => navigation.navigate('Appearance')} />
            <ListRow icon="musical-notes-outline" title="Sounds" subtitle={`Rain, Forest, White noise • ${getSound(soundId).title}`} onPress={() => navigation.navigate('Sounds')} />
            <ListRow
              icon="information-circle-outline"
              title="About"
              subtitle={`App version ${Constants.expoConfig?.version ?? '1.0.0'}`}
              onPress={() => navigation.navigate('About')}
            />
            <ListRow icon="log-out-outline" title="Log out" danger onPress={confirmLogout} last />
          </View>
        </Card>
      </View>

      <ConfirmDialog
        visible={confirmingLogout}
        icon="log-out-outline"
        title="Log out?"
        message="You can log back in anytime."
        confirmLabel="Log out"
        destructive
        onCancel={() => setConfirmingLogout(false)}
        onConfirm={() => {
          setConfirmingLogout(false);
          dispatch(performLogout());
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { height: 150, overflow: 'hidden' },
  body: { paddingHorizontal: 24, marginTop: -64, paddingBottom: 28 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '800' },
  list: { marginTop: 16 },
  rows: { paddingHorizontal: 18 },
});
