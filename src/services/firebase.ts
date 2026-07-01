import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore: getReactNativePersistence exists at runtime but isn't in the TS type defs

import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra;

const firebaseConfig = {
  apiKey: extra?.firebaseApiKey,
  authDomain: extra?.firebaseAuthDomain,
  projectId: extra?.firebaseProjectId,
  storageBucket: extra?.firebaseStorageBucket,
  messagingSenderId: extra?.firebaseMessagingSenderId,
  appId: extra?.firebaseAppId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth must be initialized differently on first load vs. hot reload,
// because initializeAuth() throws if called more than once on the same app.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Already initialized (happens on Fast Refresh) — just grab the existing instance
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;