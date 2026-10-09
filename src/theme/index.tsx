import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme, DarkTheme, type Theme as NavTheme } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';

export interface ThemeColors {
  background: string;
  gradient: [string, string];
  surface: string;
  surfaceMuted: string;
  inputBg: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primarySoft: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  accent: string;
  tabBar: string;
  leafA: string;
  leafB: string;
  shadow: string;
  overlay: string;
}

const light: ThemeColors = {
  background: '#FBF7EC',
  gradient: ['#FFF9E9', '#F1F9F2'],
  surface: '#FFFFFF',
  surfaceMuted: '#F3F8F4',
  inputBg: '#FFFFFF',
  primary: '#177A57',
  primaryPressed: '#0F6445',
  onPrimary: '#FFFFFF',
  primarySoft: '#E3F3EA',
  text: '#1D2B27',
  textMuted: '#6A7B75',
  border: '#DCE7E0',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  warning: '#F0922B',
  warningSoft: '#FDF1E0',
  success: '#2DA66F',
  accent: '#F5B544',
  tabBar: '#FFFFFF',
  leafA: '#7CC49A',
  leafB: '#B6DFC6',
  shadow: '#1D2B27',
  overlay: 'rgba(0,0,0,0.35)',
};

const dark: ThemeColors = {
  background: '#0E1815',
  gradient: ['#0E1815', '#12221D'],
  surface: '#17261F',
  surfaceMuted: '#1C2E27',
  inputBg: '#142019',
  primary: '#33B987',
  primaryPressed: '#2AA177',
  onPrimary: '#06241A',
  primarySoft: '#1F3A2F',
  text: '#E8F2EE',
  textMuted: '#93A8A0',
  border: '#27393F',
  danger: '#FF6B70',
  dangerSoft: '#3A1E20',
  warning: '#F5A54A',
  warningSoft: '#3A2A14',
  success: '#43C98D',
  accent: '#F5B544',
  tabBar: '#13201B',
  leafA: '#2F7D5C',
  leafB: '#245B45',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export interface AppTheme {
  dark: boolean;
  colors: ThemeColors;
  navTheme: NavTheme;
}

const ThemeContext = createContext<AppTheme>({
  dark: false,
  colors: light,
  navTheme: DefaultTheme,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.theme.mode);
  const system = useColorScheme();
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';

  const value = useMemo<AppTheme>(() => {
    const colors = isDark ? dark : light;
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      dark: isDark,
      colors,
      navTheme: {
        ...base,
        colors: {
          ...base.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
        },
      },
    };
  }, [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}

/** Soft card shadow that works on both iOS and Android. */
export function cardShadow(colors: ThemeColors, elevation = 3) {
  return {
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation,
  } as const;
}
