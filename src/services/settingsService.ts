import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_COLLECTION = 'settings';

export function subscribeToSettings(
  userId: string,
  onChange: (settings: UserSettings) => void,
  onError: (message: string) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, SETTINGS_COLLECTION, userId),
    (snapshot) => {
      if (snapshot.exists()) {
        onChange({ ...DEFAULT_SETTINGS, ...(snapshot.data() as Partial<UserSettings>) });
      } else {
        onChange(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      onError('Failed to load settings.');
      console.error('subscribeToSettings error:', error);
    }
  );
}

export async function updateSettings(
  userId: string,
  partial: Partial<UserSettings>
): Promise<{ error: string | null }> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, userId), partial, { merge: true });
    return { error: null };
  } catch (err) {
    console.error('updateSettings error:', err);
    return { error: 'Failed to save settings.' };
  }
}