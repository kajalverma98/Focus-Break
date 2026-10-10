import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutScreen from '../screens/AboutScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import BreakActivityScreen from '../screens/BreakActivityScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FocusTimerScreen from '../screens/FocusTimerScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SessionCompleteScreen from '../screens/SessionCompleteScreen';
import SoundsScreen from '../screens/SoundsScreen';
import WorkSetupScreen from '../screens/WorkSetupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { useAppSelector } from '../store/hooks';
import { useTheme } from '../theme';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colors } = useTheme();
  const token = useAppSelector((s) => s.auth.token);
  const seenOnboarding = useAppSelector((s) => s.settings.hasSeenOnboarding);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!seenOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !token ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="WorkSetup" component={WorkSetupScreen} />
          <Stack.Screen name="FocusTimer" component={FocusTimerScreen} options={{ animation: 'fade' }} />
          <Stack.Screen
            name="BreakActivity"
            component={BreakActivityScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="SessionComplete"
            component={SessionCompleteScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Appearance" component={AppearanceScreen} />
          <Stack.Screen name="Sounds" component={SoundsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
