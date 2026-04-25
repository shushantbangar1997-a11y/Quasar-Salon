# BeautyBooking

A small marketplace MVP made of:

- `mobile/` — Expo (React Native) client. Runs on web in this Replit via Expo Web.
- `backend/` — Firebase project (Cloud Functions + Firestore + Storage rules).

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
- `EXPO_PUBLIC_API_BASE_URL` — Railway backend URL once deployed (e.g. `https://your-api.railway.app`).

When these are missing the app still loads and shows a "Firebase not configured" notice on the home screen.

## Backend environment variables (Railway)

- `FIREBASE_SERVICE_ACCOUNT` — full JSON contents of the Firebase service account key (from Firebase Console → Project Settings → Service Accounts → Generate new private key). Railway reads this to authenticate with Firestore and Firebase Auth.
- `PORT` — set automatically by Railway; the server listens on this port.

## Railway deployment (two services)

The project is set up for two separate Railway services, each with a `railway.json`:

### Service 1 — API backend (`backend/`)
- Set **Root Directory** to `backend` in Railway.
- `railway.json` builds and starts the Express server from `backend/functions/`.
- Add env var: `FIREBASE_SERVICE_ACCOUNT` (the service account JSON string).

### Service 2 — Web frontend (`mobile/`)
- Set **Root Directory** to `mobile` in Railway.
- `railway.json` builds the Expo web bundle and serves it as a static site.
- Add env vars: all `EXPO_PUBLIC_*` variables listed above.
- Set `EXPO_PUBLIC_API_BASE_URL` to the URL of Service 1 (the Railway API backend).

## Notable changes during import

- `mobile/babel.config.js`: switched preset to `babel-preset-expo`, removed missing reanimated plugin.
- `mobile/metro.config.js`: rewritten to use `expo/metro-config`.
- `mobile/package.json`: added web peer deps, pinned `metro` to `0.80.8`.
- `mobile/src/firebase.ts`: resilient to missing env vars; exports `isFirebaseConfigured`.
- `mobile/App.tsx`: gracefully handles the no-Firebase case.
- `backend/functions/src/app.ts`: Express app extracted from `index.ts` so it can run standalone.
- `backend/functions/src/server.ts`: standalone entry point for Railway (listens on `$PORT`).
- `backend/functions/src/index.ts`: now a thin wrapper that exports the Firebase HTTPS function.
