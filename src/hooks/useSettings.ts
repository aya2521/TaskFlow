import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToSettings } from '../services/settingsService';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToSettings(
      user.uid,
      (updated) => {
        setSettings(updated);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [user]);

  return { settings, loading };
}