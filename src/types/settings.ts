import { ThemeMode } from '../context/ThemeContext';

export interface UserSettings {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
  focusModeEnabled: boolean;
  appBlockingEnabled: boolean;
  largeTextEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'system',
  notificationsEnabled: true,
  soundEnabled: true,
  language: 'en',
  focusModeEnabled: false,
  appBlockingEnabled: false,
  largeTextEnabled: false,
};