import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_CREDENTIALS, MOCK_CONFIG } from '../config';
import type {
  ApiErrorShape,
  AuthResponse,
  LoginBody,
  NewSession,
  RegisterBody,
  Session,
  User,
} from '../types';
import { normalizeIdentifier } from '../utils/validation';

/**
 * A tiny in-app "backend". It persists to AsyncStorage, simulates latency and
 * random failures, validates a bearer token and returns HTTP-like results.
 * Replace `handleRequest` with a real fetch call to go live (see src/api/api.ts).
 */

const DB_KEY = 'fb.mockdb.v1';

interface DbUser extends User {
  password: string;
}
interface DbSession extends Session {
  userId: string;
}
interface Db {
  users: DbUser[];
  sessions: DbSession[];
}

export interface MockRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  token?: string | null;
}
export type MockResult = { data: unknown } | { error: ApiErrorShape };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const fail = (status: number, message: string): { error: ApiErrorShape } => ({
  error: { status, data: { message } },
});

let cache: Db | null = null;

function seed(): Db {
  const now = new Date();
  const sessions: DbSession[] = [];
  let seedN = 11;
  const rand = () => {
    seedN = (seedN * 9301 + 49297) % 233280;
    return seedN / 233280;
  };
  let id = 1;
  const add = (daysAgo: number, hour: number, minute: number, mins: number, breaks: number, distractions: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, minute);
    sessions.push({
      id: `s_seed_${id++}`,
      userId: 'u_demo',
      date: d.toISOString(),
      focusMinutes: mins,
      breaks,
      distractions,
    });
  };

  // Today: 6 sessions, 4h 35m
  [45, 45, 45, 45, 45, 50].forEach((m, i) => add(0, 6 + (i % 6), (i * 7) % 50, m, i < 5 ? 1 : 0, i % 3 === 0 ? 1 : 0));

  // Past 45 days: current streak of 7 (today + 6 days), a gap, then a 14-day run, then random days.
  for (let d = 1; d <= 45; d++) {
    const active = d <= 6 || (d >= 8 && d <= 21) || (d > 22 && rand() > 0.3);
    if (!active) continue;
    const n = 3 + Math.floor(rand() * 5);
    for (let i = 0; i < n; i++) add(d, 8 + i, 5, [25, 25, 30, 45][Math.floor(rand() * 4)], 1, rand() > 0.7 ? 1 : 0);
  }

  return {
    users: [
      {
        id: 'u_demo',
        name: 'Kajal Verma',
        identifier: DEMO_CREDENTIALS.identifier,
        password: DEMO_CREDENTIALS.password,
        tagline: 'Focus better. Live healthier.',
      },
    ],
    sessions,
  };
}

async function saveDb() {
  if (cache) await AsyncStorage.setItem(DB_KEY, JSON.stringify(cache));
}

async function loadDb(): Promise<Db> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(DB_KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as Db;
      return cache;
    } catch {
      // fall through and reseed
    }
  }
  cache = seed();
  await saveDb();
  return cache;
}

function makeToken(userId: string) {
  return `mock.${userId}.${Date.now() + MOCK_CONFIG.tokenTtlMs}`;
}

function userFromToken(db: Db, token?: string | null): DbUser | null {
  if (!token) return null;
  const [prefix, userId, exp] = token.split('.');
  if (prefix !== 'mock' || !userId || Number(exp) < Date.now()) return null;
  return db.users.find((u) => u.id === userId) ?? null;
}

function publicUser({ password: _pw, ...user }: DbUser): User {
  return user;
}

export async function handleRequest(req: MockRequest): Promise<MockResult> {
  const span = MOCK_CONFIG.maxDelayMs - MOCK_CONFIG.minDelayMs;
  await sleep(MOCK_CONFIG.minDelayMs + Math.random() * span);

  if (MOCK_CONFIG.failureRate > 0 && Math.random() < MOCK_CONFIG.failureRate) {
    return fail(503, 'Service temporarily unavailable. Please try again.');
  }

  const db = await loadDb();
  const route = `${req.method ?? 'GET'} ${req.url}`;

  switch (route) {
    case 'POST /auth/login': {
      const body = req.body as LoginBody;
      const id = normalizeIdentifier(body.identifier);
      const user = db.users.find((u) => u.identifier === id);
      if (!user || user.password !== body.password) {
        return fail(401, 'Incorrect email/mobile or password.');
      }
      const res: AuthResponse = { user: publicUser(user), token: makeToken(user.id) };
      return { data: res };
    }

    case 'POST /auth/register': {
      const body = req.body as RegisterBody;
      const id = normalizeIdentifier(body.identifier);
      if (db.users.some((u) => u.identifier === id)) {
        return fail(409, 'An account with this email or mobile number already exists.');
      }
      const user: DbUser = {
        id: `u_${Date.now()}`,
        name: body.name.trim(),
        identifier: id,
        password: body.password,
        tagline: 'Small steps make big progress.',
      };
      db.users.push(user);
      await saveDb();
      const res: AuthResponse = { user: publicUser(user), token: makeToken(user.id) };
      return { data: res };
    }

    case 'POST /auth/forgot-password': {
      const body = req.body as { identifier: string };
      const id = normalizeIdentifier(body.identifier);
      if (!db.users.some((u) => u.identifier === id)) {
        return fail(404, 'No account found with this email or mobile number.');
      }
      return { data: { message: 'Reset link sent. Please check your inbox or SMS.' } };
    }
  }

  // ---- Authenticated routes ----
  const me = userFromToken(db, req.token);
  if (!me) return fail(401, 'Your session has expired. Please log in again.');

  switch (route) {
    case 'GET /me':
      return { data: publicUser(me) };

    case 'PUT /me': {
      const body = req.body as { name: string; tagline: string };
      me.name = body.name.trim();
      me.tagline = body.tagline.trim();
      await saveDb();
      return { data: publicUser(me) };
    }

    case 'GET /sessions': {
      const list: Session[] = db.sessions
        .filter((s) => s.userId === me.id)
        .map(({ userId: _u, ...s }) => s);
      return { data: list };
    }

    case 'POST /sessions': {
      const body = req.body as NewSession;
      const s: DbSession = {
        id: `s_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: me.id,
        date: body.date ?? new Date().toISOString(),
        focusMinutes: body.focusMinutes,
        breaks: body.breaks,
        distractions: body.distractions,
      };
      db.sessions.push(s);
      await saveDb();
      const { userId: _u, ...out } = s;
      return { data: out };
    }
  }

  return fail(404, `Route not found: ${route}`);
}
