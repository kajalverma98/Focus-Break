import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StyleSheet } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { ToastProvider } from './src/components/Toast';
import RootNavigator from './src/navigation/RootNavigator';
import type { RootStackParamList } from './src/navigation/types';
import SplashScreen from './src/screens/SplashScreen';
import { setupNotificationChannel } from './src/services/notifications';
import { persistor, store } from './src/store';
import { reconcileTimer } from './src/store/thunks';
import { ThemeProvider, useTheme } from './src/theme';

const MIN_SPLASH_MS = 1800;

const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Reopens the screen for a session that was still active when the app was closed. */
function resumeActiveSession() {
  const { auth, timer } = store.getState();
  if (!auth.token || !navigationRef.isReady()) return;
  if (timer.phase === 'focus') navigationRef.navigate('FocusTimer');
  else if (timer.phase === 'break') navigationRef.navigate('BreakActivity');
  else if (timer.phase === 'focusDone') navigationRef.navigate('SessionComplete');
}

function Root() {
  const { navTheme, colors } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  // Finish any phase that ended while the app was closed before showing a screen.
  const reconciled = useRef<Promise<unknown> | null>(null);
  if (!reconciled.current) reconciled.current = store.dispatch(reconcileTimer());

  // Paint the native root view in the theme colour so screen transitions never flash white.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  useEffect(() => {
    setupNotificationChannel();
    const t = setTimeout(() => setSplashDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (!splashDone) return <SplashScreen />;

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={() => reconciled.current?.then(resumeActiveSession)}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            {/* Waits for persisted state (auth token, settings, theme) before rendering */}
            <PersistGate loading={<SplashScreen />} persistor={persistor}>
              <ToastProvider>
                <Root />
              </ToastProvider>
            </PersistGate>
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
