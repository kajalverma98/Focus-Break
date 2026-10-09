import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** horizontal padding (default true) */
  padded?: boolean;
  /** SafeArea edges to respect */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Replace the themed gradient background (e.g. the focus-mode sky). */
  background?: React.ReactNode;
  lightStatusBar?: boolean;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  refreshControl,
  contentStyle,
  background,
  lightStatusBar,
}: Props) {
  const { colors, dark } = useTheme();
  const inner: StyleProp<ViewStyle> = [padded && styles.padded, contentStyle];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {background ?? <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />}
      <StatusBar style={lightStatusBar ? 'light' : dark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.root} edges={edges}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl}
              contentContainerStyle={[{ flexGrow: 1 }, inner]}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.root, inner]}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  padded: { paddingHorizontal: 24 },
});
