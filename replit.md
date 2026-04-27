# Quasar Salon

A premium salon booking app for Quasar Salon, built with:

- `mobile/` — Expo (React Native) client. Runs on web in this Replit via Expo Web.
- `backend/` — Firebase project (Cloud Functions + Firestore + Storage rules).

## App Overview

**Quasar Salon** is a Zomato-style booking app for a luxury salon. Clients can:
- Browse the full Quasar service menu (15 categories, 100+ services)
- Add multiple services to a cart (like food ordering)
- Book appointments with a specific stylist
- Select date and time slot (with availability shown)
- View their booking history

## Brand

- Background: `#FFFFFF` (white) / `#FAF8F5` (card) / `#F5F0E8` (elevated)
- Primary: `#C9A84C` (royal gold)
- Text: `#111111` (near-black) / `#5C4033` (secondary) / `#9C8878` (muted)
- Logo: `mobile/src/components/QuasarLogoSvg.tsx` (custom SVG — crown + Q-ring + sparkle, no JPEG bg)
- Splash: `mobile/src/screens/SplashScreen.tsx` — animated gold fill-from-bottom on white background

## File Structure

```
mobile/
  App.tsx                        — Root entry point. Splash screen state + navigation.
  assets/quasar-logo.jpg         — Original JPEG logo (NOT used in-app; SVG used instead)
  src/
    theme.ts                     — Light theme colors, fonts, spacing
    quasarData.ts                — Full service catalog (15 categories w/ imageUrls) + staff
    CartContext.tsx               — React Context cart (add/remove/clear services)
    components/
      QuasarLogoSvg.tsx          — Custom SVG crown+Q-ring logo, gold color, no black background
    screens/
      SplashScreen.tsx           — Animated splash: gold fills logo from bottom on white bg
      HomeScreen.tsx             — Quasar-branded home with category images + popular picks
      CategoryScreen.tsx         — Service list per category with Add/Qty buttons
      CartScreen.tsx             — Cart management + price breakdown
      BookingScreen.tsx          — 4-step booking: Date → Time → Stylist → Confirm
      BookingSuccessScreen.tsx   — Confirmation screen shown after booking
      MyBookingsScreen.tsx       — Upcoming + past bookings tabs
      SearchScreen.tsx           — Full-text search across all services with add-to-cart
      ProfileScreen.tsx          — User profile + menu
      LoginScreen.tsx            — Email login (optional)
      SignUpScreen.tsx           — Account creation (optional)
    firebase.ts                  — Firebase initialization (graceful if env vars missing)
    api.ts                       — API client for backend
    demoData.ts                  — Legacy file (not imported; kept for reference)
    services/                    — Backend API service helpers
```

## Replit setup

- Workflow `Start application` runs Expo on port `5000` with three injected env vars:
  - `EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN` — the URL Expo advertises in the manifest / QR.
  - `REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN` — the host Expo binds in the manifest.
  - `EXPO_PUBLIC_API_BASE_URL=https://$REPLIT_DEV_DOMAIN` — public origin baked into the JS bundle. The client appends `/api/...` and Metro proxies that to the backend (see below). Used for both web and native.
  Plus a fail-fast guard that exits if `REPLIT_DEV_DOMAIN` is unset.
- This makes Expo announce its manifest URL as the public Replit domain (no port suffix — port 5000 is mapped to external HTTPS port 80), so the QR code Expo prints in the workflow logs points at a real public HTTPS URL that Expo Go can reach on any phone (no ngrok required).
- Web preview iframe also works on port 5000 unchanged. The browser uses relative `/api/...` URLs (see `mobile/src/api.ts`), which hit the same dev-server proxy.
- Assumption: this relies on Replit keeping `REPLIT_DEV_DOMAIN` set and the port mapping `localPort 5000 -> externalPort 80`. If either changes, this workflow needs to be updated.

### Backend reachability via Metro proxy

Replit only routes one external HTTPS port (5000 -> 80) reliably for this repl, so the public `https://8080-<repl-domain>` URL does NOT actually reach the backend (it returns Replit's "Run this app" placeholder page). To work around this, `mobile/metro.config.js` adds an `enhanceMiddleware` that proxies any request starting with `/api/` to `http://localhost:8080` (stripping the `/api` prefix). All API calls — from both the browser preview AND the phone via Expo Go — therefore hit `https://<repl-domain>/api/...` and get forwarded to the Express backend.

This means the `Start Backend` workflow must be running for any API call to succeed.

### Phone testing with Expo Go
1. Open the workflow logs for `Start application` and find the QR or the `exp://...sisko.replit.dev` URL.
2. Scan it with Expo Go (Android) or the Camera app (iOS).
3. The Quasar Salon app loads inside Expo Go directly from the Replit dev server.

Troubleshooting:
- **App loads but Sign In / Cart / Booking calls fail**: confirm the `Start Backend` workflow is running, and verify `curl https://$REPLIT_DEV_DOMAIN/api/staff` returns JSON from the backend (not the Replit placeholder HTML). If you see HTML, the Metro middleware in `mobile/metro.config.js` is broken or backend isn't on `localhost:8080`.
- **QR opens "HTTP 502" in Expo Go**: confirm Replit didn't change the port mapping (5000 must map to external 80) and that the workflow's fail-fast guard didn't trip on a missing `REPLIT_DEV_DOMAIN`.
- **Replit dev domain / proxy stops behaving as expected**: as a fallback, change the `Start application` command to `npx expo start --tunnel --port 5000` (drops the `EXPO_PACKAGER_PROXY_URL` / `REACT_NATIVE_PACKAGER_HOSTNAME` overrides). Tunnel mode requires the bundled ngrok service to be healthy; if ngrok itself is down (`Cannot read properties of undefined (reading 'body')` style errors), the env-var workflow above is the only reliable path until ngrok recovers.

### Port mapping notes
Only `localPort 5000 -> externalPort 80` and `localPort 8080 -> externalPort 8080` are declared in `.replit`. The `8080` entry exists because the `Start Backend` workflow has `waitForPort = 8080` (so Replit re-asserts it on every restart), but the public `https://8080-<repl-domain>` URL is intentionally NOT used by the app — Replit only routes one external HTTPS port reliably here, so the Metro `/api` proxy (above) is what the app uses. Port 8081 (Metro's traditional default) is intentionally not declared, because `expo start --web --port 5000` makes Metro bind to 5000 and the Replit Expo proxy at `<repl>.expo.sisko.replit.dev` is not on the hot path.

## Backend deployment (Replit)

The backend runs as a standalone Express server in a `Start Backend` Replit workflow:
- Command: `cd backend && PORT=8080 node functions/lib/server.js`
- Port: 8080
- Entry point: `backend/functions/src/server.ts` (compiled to `lib/server.js`)

The backend uses Firebase Admin SDK with service account credentials from `FIREBASE_SERVICE_ACCOUNT`.

Firebase project: **quasar-salon**
- `.firebaserc` updated to reference `quasar-salon`
- Firestore security rules deployed (allow authenticated users to read/write their own bookings)
- 8 staff members seeded via `backend/scripts/seedStaff.js`

## Authentication

Three sign-in methods are implemented (Task #22):

1. **Email + Password** — existing Firebase email/password; sign-in on LoginScreen, create account on SignUpScreen
2. **Email OTP** — user enters email → backend sends 6-digit code via Gmail SMTP (nodemailer) → OTPScreen → `signInWithCustomToken`; backend endpoints: `POST /auth/send-otp` + `POST /auth/verify-otp` using Firestore `otps` collection (5-min expiry)
3. **Google Sign-In** — `expo-auth-session/providers/google` + `GoogleAuthProvider.credential` + `signInWithCredential`; available on both Login and Sign-Up screens

OTP flow: code stored in Firestore `otps/{email}` doc, deleted after first successful use to prevent replay.

ProfileScreen shows displayName/email from `auth.currentUser` and has a Sign Out button.

## Environment variables (all set in shared environment)

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` — `quasar-salon.firebaseapp.com`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` — `quasar-salon`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_API_BASE_URL` — public origin for the Expo dev server (Metro proxies `/api/*` to the backend)
- `FIREBASE_SERVICE_ACCOUNT` — full JSON of Firebase Admin SDK service account key
- `OTP_EMAIL_USER` — Gmail address used to send OTP emails (secret)
- `OTP_EMAIL_PASS` — Gmail App Password for OTP email sending (secret)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth web client ID for Google Sign-In (secret)

## Live booking flow

1. `BookingScreen` fetches staff from `GET /staff` (live Firestore data)
2. `BookingScreen` checks availability via `GET /staff/:id/availability?date=&duration=`
3. On confirm, `POST /bookings` runs a Firestore transaction: blocks all slots + creates booking doc
4. `BookingsContext` uses `onSnapshot` on `bookings` collection for real-time updates in My Bookings

## Staff & Availability

- 8 staff profiles in Firestore `staff` collection (seeded by `backend/scripts/seedStaff.js`)
- Blocked slots stored in Firestore `blocked_slots` collection keyed by `staffId__date__slot`
- Slot availability is determined by schedule + blocked_slots; booking transaction is atomic

## Metro pinned package

- `metro` pinned to `0.80.8` in `mobile/package.json` overrides — do NOT upgrade
