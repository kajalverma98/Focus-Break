import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  WorkSetup: undefined;
  FocusTimer: { autoStart?: boolean } | undefined;
  BreakActivity: undefined;
  SessionComplete: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Appearance: undefined;
  Sounds: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Streak: undefined;
  Settings: undefined;
};

export type StackNavigation = NativeStackNavigationProp<RootStackParamList>;

/** For screens that live inside the tab navigator but also push stack screens. */
export type TabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
