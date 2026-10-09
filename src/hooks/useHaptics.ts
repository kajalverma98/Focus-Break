import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppSelector } from '../store/hooks';

export function useHaptics() {
  const enabled = useAppSelector((s) => s.settings.haptics);

  const tap = useCallback(() => {
    if (enabled) Haptics.selectionAsync().catch(() => undefined);
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [enabled]);

  const warning = useCallback(() => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  }, [enabled]);

  return { tap, success, warning };
}
