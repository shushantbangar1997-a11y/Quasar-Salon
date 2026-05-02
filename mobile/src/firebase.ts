import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, inMemoryPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  const existingApps = getApps();
  app = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig as Record<string, string>);

  if (Platform.OS === 'web') {
    // Web: getAuth uses browser localStorage by default
    auth = getAuth(app);
  } else {
    // React Native / Hermes: bare getAuth() causes "Component auth has not been registered yet".
    // initializeAuth with explicit persistence is required on native.
    // Metro resolves firebase/auth to its react-native bundle which exports
    // getReactNativePersistence — but the default TS types don't know about it,
    // so we access it via a typed require to avoid the TS error.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const firebaseAuth = require('firebase/auth') as {
        getReactNativePersistence?: (storage: unknown) => unknown;
      };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      if (firebaseAuth.getReactNativePersistence && AsyncStorage) {
        const rnPersistence = firebaseAuth.getReactNativePersistence(AsyncStorage);
        auth = initializeAuth(app, { persistence: rnPersistence as typeof inMemoryPersistence });
      } else {
        auth = initializeAuth(app, { persistence: inMemoryPersistence });
      }
    } catch {
      // Auth already initialised on this app instance (hot reload) — grab the existing one
      try { auth = getAuth(app); } catch { /* ignore */ }
    }
  }

  db = getFirestore(app);
} else {
  // Use a release-safe logger so we don't leak diagnostic noise in production.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { logger } = require('./logger') as typeof import('./logger');
  logger.warn(
    'Firebase config not provided. Set EXPO_PUBLIC_FIREBASE_* environment variables to enable auth/Firestore.'
  );
}

export { app, auth, db };
