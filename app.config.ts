import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TaskFlow',
  slug: 'task-flow',
  extra: {
    firebaseApiKey: "AIzaSyAa0YdHb3r-9CEnm5jFFATq2Lf1S_i-k0I",
    firebaseAuthDomain: "taskflow-f5479.firebaseapp.com",
    firebaseProjectId: "taskflow-f5479",
    firebaseStorageBucket: "taskflow-f5479.firebasestorage.app",
    firebaseMessagingSenderId: "601114907511",
    firebaseAppId: "1:601114907511:web:3f0ccacfc59c01d0188772",
  },
});