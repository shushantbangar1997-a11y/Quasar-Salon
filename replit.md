# BeautyBooking

A small marketplace MVP made of:

- `mobile/` — Expo (React Native) client. Runs on web in this Replit via Expo Web.
- `backend/` — Firebase project (Cloud Functions + Firestore + Storage rules).

## Replit setup

- Workflow `Start application` runs `cd mobile && npx expo start --web --port 5000 --host lan` and serves the web build on port `5000`.
- Frontend binds host through Expo Web (Metro dev server) which accepts proxied requests, so it works inside the Replit preview iframe.
- Backend Firebase Functions are not started inside Replit (they are designed for Firebase Cloud Functions / the Firebase Emulator Suite). For full end-to-end usage, run the Firebase Emulator Suite locally, or deploy the functions to your own Firebase project, then point the mobile client at the deployed URL.

## Mobile app environment variables

The Expo client reads its config from `EXPO_PUBLIC_*` env vars (loaded automatically by Expo at build time):

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_API_BASE_URL` — base URL for the Firebase HTTPS function (e.g. `https://<region>-<project>.cloudfunctions.net/api` or the emulator URL).

When these are missing the app still loads and shows a "Firebase not configured" notice on the home screen.

## Notable changes during import

- `mobile/babel.config.js`: switched preset from `metro-react-native-babel-preset` to `babel-preset-expo` and removed the `react-native-reanimated/plugin` (the package is not installed).
- `mobile/metro.config.js`: rewritten to use `expo/metro-config` so Expo's Metro setup is preserved.
- `mobile/package.json`: added the web peer deps (`react-dom`, `react-native-web`, `@expo/metro-runtime`), `babel-preset-expo`, `babel-plugin-module-resolver`, and pinned `metro` packages to `0.80.8` via `overrides`/`resolutions` (the bundled `@expo/cli@0.18.31` requires `metro/src/lib/TerminalReporter`, removed in metro `>=0.80.9`).
- `mobile/src/firebase.ts`: Firebase init is now resilient to missing env vars; exports `isFirebaseConfigured`.
- `mobile/App.tsx`: gracefully handles the no-Firebase case and wraps the screen in a `ScrollView` so it works on small heights.

## Deployment

Configured as a static deployment:

- Build: `cd mobile && npx expo export --platform web --output-dir dist`
- Public directory: `mobile/dist`

Press the Publish button in Replit to deploy. For a fully-functional published app you must also set the `EXPO_PUBLIC_*` variables and deploy the Firebase backend separately.
