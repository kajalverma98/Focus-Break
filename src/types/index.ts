export interface User {
  id: string;
  name: string;
  identifier: string;
  tagline: string;
}

export interface Session {
  id: string;
  /** ISO timestamp */
  date: string;
  focusMinutes: number;
  breaks: number;
  distractions: number;
}

export interface NewSession {
  focusMinutes: number;
  breaks: number;
  distractions: number;
  date?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginBody {
  identifier: string;
  password: string;
}

export interface RegisterBody extends LoginBody {
  name: string;
}

export interface ApiErrorShape {
  status: number;
  data: { message: string };
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type StatsRange = 'today' | 'week' | 'month';
