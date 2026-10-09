import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm, type Control } from 'react-hook-form';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SelectField } from '../components/SelectField';
import { useToast } from '../components/Toast';
import type { IconName } from '../constants/activities';
import { BREAK_OPTIONS, FOCUS_OPTIONS, LONG_BREAK_OPTIONS, WORK_HOUR_OPTIONS, type Option } from '../constants/options';
import type { StackNavigation } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setWorkSetup } from '../store/slices/settingsSlice';
import { useTheme } from '../theme';
import { workSetupSchema, type WorkSetupForm } from '../utils/validation';

interface RowSpec {
  name: keyof WorkSetupForm;
  icon: IconName;
  title: string;
  hint: string;
  options: Option[];
}

const ROWS: RowSpec[] = [
  { name: 'workHours', icon: 'time-outline', title: 'Total work duration', hint: 'How many hours do you want to work?', options: WORK_HOUR_OPTIONS },
  { name: 'focusMinutes', icon: 'sync-outline', title: 'Focus duration', hint: 'Time to focus on your work', options: FOCUS_OPTIONS },
  { name: 'breakMinutes', icon: 'alarm-outline', title: 'Break duration', hint: 'Time for a short break', options: BREAK_OPTIONS },
  { name: 'longBreakMinutes', icon: 'cafe-outline', title: 'Long break (optional)', hint: 'After 4 sessions, take a longer break', options: LONG_BREAK_OPTIONS },
];

export default function WorkSetupScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<StackNavigation>();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const settings = useAppSelector((s) => s.settings);
  const phase = useAppSelector((s) => s.timer.phase);

  const { control, handleSubmit } = useForm<WorkSetupForm>({
    resolver: zodResolver(workSetupSchema),
    mode: 'onChange',
    defaultValues: {
      workHours: settings.workHours,
      focusMinutes: settings.focusMinutes,
      breakMinutes: settings.breakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
    },
  });

  const save = (thenStart: boolean) =>
    handleSubmit((values) => {
      dispatch(setWorkSetup(values));
      if (thenStart) {
        navigation.navigate('FocusTimer', { autoStart: phase !== 'focus' });
      } else {
        toast.show('Settings saved', 'success');
        navigation.goBack();
      }
    });

  return (
    <Screen scroll>
      <ScreenHeader title="Work Setup" />
      <Text style={[styles.heading, { color: colors.text }]}>Set your work schedule</Text>

      <Card style={styles.card} padding={0}>
        {ROWS.map((row, i) => (
          <SetupRow key={row.name} spec={row} control={control} last={i === ROWS.length - 1} />
        ))}
      </Card>

      <View style={styles.footer}>
        <Button title="Start" onPress={save(true)} testID="work-setup-start" />
        <Button title="Save settings" variant="outline" onPress={save(false)} />
      </View>
    </Screen>
  );
}

function SetupRow({ spec, control, last }: { spec: RowSpec; control: Control<WorkSetupForm>; last: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={styles.rowHead}>
        <Ionicons name={spec.icon} size={22} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{spec.title}</Text>
          <Text style={[styles.rowHint, { color: colors.textMuted }]}>{spec.hint}</Text>
        </View>
      </View>
      <Controller
        control={control}
        name={spec.name}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <SelectField
            title={spec.title}
            value={value}
            options={spec.options}
            onChange={onChange}
            error={error?.message}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 17, fontWeight: '800', marginTop: 10, marginBottom: 14 },
  card: { overflow: 'hidden' },
  row: { padding: 16, gap: 12 },
  rowHead: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  rowTitle: { fontSize: 14.5, fontWeight: '700' },
  rowHint: { fontSize: 12, marginTop: 2 },
  footer: { gap: 12, marginTop: 24, paddingBottom: 24 },
});
