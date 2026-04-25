# Quasar Salon

A premium salon booking app for Quasar Salon, built with:

- `mobile/` — Expo (React Native) client. Runs on web in this Replit via Expo Web.
- `backend/` — Firebase project (Cloud Functions + Firestore + Storage rules).

## App Overview

**Quasar Salon** is a Zomato-style booking app for a luxury salon. Clients can:
- Browse the full Quasar service menu (14 categories, 100+ services)
- Add multiple services to a cart (like food ordering)
- Book appointments with a specific stylist
- Select date and time slot (with availability shown)
- View their booking history

## Brand

- Background: `#0D0D0D` (deep black)
- Primary: `#C9A84C` (champagne gold)
- Text: `#F5F0E8` (warm off-white)
- Logo: `mobile/assets/quasar-logo.jpg` (crown-Q mark)

## File Structure

```
mobile/
  App.tsx                        — Root entry point. Wraps with CartProvider + Navigation.
  assets/quasar-logo.jpg         — Quasar crown-Q logo
  src/
    theme.ts                     — Brand colors, fonts, spacing
    quasarData.ts                — Full service catalog + staff profiles + time slots
    CartContext.tsx               — React Context cart (add/remove/clear services)
    screens/
      HomeScreen.tsx             — Quasar-branded home with category grid + popular picks
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

- Workflow `Start application` runs `cd mobile && npx expo start --web --port 5000 --host lan` and serves the web build on port `5000`.
- Frontend binds host through Expo Web (Metro dev server) which accepts proxied requests, so it works inside the Replit preview iframe.

## Mobile app environment variables

The Expo client reads its config from `EXPO_PUBLIC_*` env vars (loaded automatically by Expo at build time):

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_API_BASE_URL` — Railway backend URL once deployed.

## Backend environment variables (Railway)

- `FIREBASE_SERVICE_ACCOUNT` — full JSON contents of the Firebase service account key.
- `PORT` — set automatically by Railway; the server listens on this port.

## Railway deployment (two services)

### Service 1 — API backend (`backend/`)
- Set **Root Directory** to `backend` in Railway.
- `railway.json` builds and starts the Express server from `backend/functions/`.
- Add env var: `FIREBASE_SERVICE_ACCOUNT`.

### Service 2 — Web frontend (`mobile/`)
- Set **Root Directory** to `mobile` in Railway.
- `railway.json` builds the Expo web bundle and serves it as a static site.
- Add env vars: all `EXPO_PUBLIC_*` variables listed above.

## Staff & Availability (current state)

- 8 demo staff profiles in `quasarData.ts` with names, roles, specialties, weekly schedules
- `DEMO_BUSY_SLOTS` in `quasarData.ts` simulates pre-booked time slots per staff member
- Task #2 will wire this to real Firestore data with live slot blocking

## Metro pinned package

- `metro` pinned to `0.80.8` in `mobile/package.json` overrides — do NOT upgrade
