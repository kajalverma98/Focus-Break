import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';

interface Props {
  title?: string;
  onBack?: () => void;
  /** hide the back arrow */
  noBack?: boolean;
  right?: React.ReactNode;
  /** white text for dark backgrounds */
  light?: boolean;
}

export function ScreenHeader({ title, onBack, noBack, right, light }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const tint = light ? '#FFFFFF' : colors.text;

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {noBack ? null : (
          <Pressable
            onPress={onBack ?? (() => navigation.goBack())}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={tint} />
          </Pressable>
        )}
      </View>
      <Text style={[styles.title, { color: tint }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 48 },
  side: { width: 44, justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
});
