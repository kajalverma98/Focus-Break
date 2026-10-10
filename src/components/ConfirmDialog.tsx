import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconName } from '../constants/activities';
import { cardShadow, radius, useTheme } from '../theme';
import { Button } from './Button';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm action as destructive (red). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Themed replacement for `Alert.alert` confirmations. */
export function ConfirmDialog({
  visible,
  title,
  message,
  icon = 'alert-circle-outline',
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const tone = destructive ? colors.danger : colors.primary;
  const toneSoft = destructive ? colors.dangerSoft : colors.primarySoft;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.center}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onCancel}
          accessibilityLabel={cancelLabel}
        />
        <View
          accessibilityViewIsModal
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, cardShadow(colors, 8)]}
        >
          <View style={[styles.iconWrap, { backgroundColor: toneSoft }]}>
            <Ionicons name={icon} size={28} color={tone} />
          </View>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {title}
          </Text>
          {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
          {/* The safe choice is the filled button: "cancel" when destructive, otherwise "confirm". */}
          <View style={styles.actions}>
            {destructive ? (
              <>
                <Button title={cancelLabel} onPress={onCancel} />
                <Button title={confirmLabel} variant="danger" onPress={onConfirm} />
              </>
            ) : (
              <>
                <Button title={confirmLabel} onPress={onConfirm} />
                <Button title={cancelLabel} variant="outline" onPress={onCancel} />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '800', marginTop: 14, textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, marginTop: 6, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 22 },
});
