import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StyleSheet } from 'react-native';
import { ToastProvider } from './src/components/Toast';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { setupNotificationChannel } from './src/services/notifications';
import { persistor, store } from './src/store';
import { ThemeProvider, useTheme } from './src/theme';

const MIN_SPLASH_MS = 1800;

function Root() {
  const { navTheme } = useTheme();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    setupNotificationChannel();
    const t = setTimeout(() => setSplashDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (!splashDone) return <SplashScreen />;

  return (
    <NavigationContainer theme={navTheme}>
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
