# Focus & Break

A Pomodoro-style focus and healthy-break app built with **Expo (SDK 57) + React Native + TypeScript**.
Works on iOS and Android (tested against Expo Go constraints – no custom native code).

## Run it

```bash
npm install
npx expo start        # then press "a" (Android), "i" (iOS) or scan the QR with Expo Go
```

**Demo login:** `demo@focusbreak.app` / `Focus@123` (the Login screen also has a "fill credentials" link).
Or tap **Create Account** to register a new user (starts with empty stats).

## Stack

| Concern | Choice |
| --- | --- |
| Navigation | React Navigation (native stack + bottom tabs) |
| State | Redux Toolkit slices: `auth`, `settings`, `theme`, `stats`, `timer` |
| API | RTK Query (`src/api/api.ts`) on top of an in-app **mock server** |
| Persistence | `redux-persist` (AsyncStorage); `auth` slice uses **expo-secure-store** |
| Forms/validation | `react-hook-form` + `zod` |
| Charts/rings | `react-native-svg` |
| Extras | `expo-notifications`, `expo-audio`, `expo-keep-awake`, `expo-haptics`, `expo-linear-gradient` |

## Flow

Splash → Onboarding (2 pages) → Login / Register / Forgot Password → Home →
Work Setup → Focus Timer → Session Complete → Break Activity → (auto) next Focus Timer.
Tabs: Home · Stats · Streak · Settings (Edit Profile, Focus & Break Settings, Notifications, Appearance, Sounds, About, Log out).

Timer rules: after `sessionsBeforeLongBreak` (4) focus sessions the break becomes the long break.
The countdown is wall-clock based (`endAt`), so it stays accurate when the app is backgrounded,
and a local notification is scheduled for when each phase ends.

## Validation rules

- **Email or mobile:** valid email, or 10-digit Indian mobile starting 6–9 (`+91`/spaces are normalised)
- **Password (register):** ≥ 8 chars, upper + lower case + number; confirm password must match
- **Full name:** 2–50 characters, letters only
- **Work Setup:** break < focus; focus ≤ total work time; long break ≥ short break

## Mock API → real API

All requests go through one function, `baseQuery` in `src/api/api.ts`, which currently calls
`handleRequest` in `src/api/mockServer.ts` (AsyncStorage-backed, simulated latency, bearer-token auth,
HTTP-like errors). To go live, replace that call with `fetch(API_BASE_URL + url, …)` and return
`{ data }` or `{ error: { status, data: { message } } }`. Screens and slices don't change.

Handy toggles in `src/config.ts`: `MOCK_CONFIG.failureRate` (e.g. `0.3`) to see error/retry states,
and `minDelayMs` / `maxDelayMs` to change latency.

Endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`,
`GET|PUT /me`, `GET|POST /sessions`.

## Project structure

```
src/
  api/          RTK Query api + mock server
  components/   Button, TextField, Card, ProgressRing, BarChart, Toast, SelectField, …
  constants/    break activities, dropdown options, ambient sounds
  hooks/        useCountdown, useHaptics
  navigation/   RootNavigator (auth-gated), MainTabs, param types
  screens/      all screens (auth/ for login, register, forgot password)
  services/     notifications, ambient audio
  store/        slices, thunks, persistence, typed hooks
  theme/        light/dark palettes + ThemeProvider
  utils/        validation (zod), stats maths, formatting
assets/sounds/  placeholder rain / forest / white-noise loops
```

## Notes

- **Illustrations:** the design's artwork isn't bundled; screens use SVG leaves, soft shapes and icons in the same
  palette. Drop real images into `HeroArt` when you have them.
- **Sounds:** `assets/sounds/*.wav` are synthetic placeholders so the feature works out of the box. Replace them
  with real recordings using the same file names.
- **Timer persistence:** the running timer is intentionally not persisted across app restarts.
- **Failed uploads:** if saving a session fails, it is queued (persisted) and retried on the next Home visit.
- **Expo Go:** local notifications work; remote push is not used. Notification behaviour is most reliable in a development build.
