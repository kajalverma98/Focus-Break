export const APP_NAME = 'Focus & Break';
export const APP_TAGLINE = 'Work Smarter • Feel Better';

/**
 * Mock backend configuration.
 * Set USE_MOCK_API to false and fill in API_BASE_URL to talk to a real server
 * (see src/api/api.ts for the single place where the transport is chosen).
 */
export const USE_MOCK_API = true;
export const API_BASE_URL = 'https://api.example.com/v1';

export const MOCK_CONFIG = {
  minDelayMs: 500,
  maxDelayMs: 1100,
  /** 0 = never fail, 0.2 = 20% of requests return a 503 (handy for testing error states) */
  failureRate: 0,
  tokenTtlMs: 7 * 24 * 60 * 60 * 1000,
};

export const DEMO_CREDENTIALS = {
  identifier: 'demo@focusbreak.app',
  password: 'Focus@123',
};
