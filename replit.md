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

## Environment variables (all set in shared environment)

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` — `quasar-salon.firebaseapp.com`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` — `quasar-salon`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_API_BASE_URL` — Replit backend URL (port 8080 dev domain)
- `FIREBASE_SERVICE_ACCOUNT` — full JSON of Firebase Admin SDK service account key

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
