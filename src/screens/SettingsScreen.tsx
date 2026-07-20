import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import { useSettings } from '../hooks/useSettings';
import { updateSettings } from '../services/settingsService';
import { UserSettings } from '../types/settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

const THEME_OPTIONS: ThemeMode[] = ['light', 'dark', 'system'];

export default function SettingsScreen({ navigation }: Props) {
  const { theme, mode, setMode } = useTheme();
  const { user } = useAuth();
  const { settings, loading } = useSettings();
  const [loggingOut, setLoggingOut] = useState(false);

  function handleToggle(key: keyof UserSettings, value: boolean) {
    if (!user) return;
    updateSettings(user.uid, { [key]: value } as Partial<UserSettings>);
  }

  function handleThemeSelect(newMode: ThemeMode) {
    setMode(newMode);
    if (user) updateSettings(user.uid, { themeMode: newMode });
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    setLoggingOut(false);
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.primary }}>← Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <Section title="Appearance" theme={theme}>
        <Text style={[styles.label, { color: theme.text }]}>Theme</Text>
        <View style={styles.pillRow}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => handleThemeSelect(opt)}
              style={[styles.pill, { borderColor: theme.border, backgroundColor: mode === opt ? theme.primary : 'transparent' }]}
            >
              <Text style={{ color: mode === opt ? '#fff' : theme.text, fontSize: 13 }}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Notifications" theme={theme}>
        <SettingRow theme={theme} label="Task reminders" description="1 day and 1 hour before due tasks"
          value={settings.notificationsEnabled} onChange={(v) => handleToggle('notificationsEnabled', v)} />
      </Section>

      <Section title="Sound" theme={theme}>
        <SettingRow theme={theme} label="Sound effects" description="Play a sound on task completion"
          value={settings.soundEnabled} onChange={(v) => handleToggle('soundEnabled', v)} />
      </Section>

      <Section title="Focus" theme={theme}>
        <SettingRow theme={theme} label="Focus Mode" description="Coming soon — hides distractions while you work"
          value={settings.focusModeEnabled} onChange={(v) => handleToggle('focusModeEnabled', v)} />
        <SettingRow theme={theme} label="App Blocking" description="Coming soon — blocks distracting apps during Focus Mode"
          value={settings.appBlockingEnabled} onChange={(v) => handleToggle('appBlockingEnabled', v)} />
      </Section>

      <Section title="Language" theme={theme}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>English (more languages coming soon)</Text>
      </Section>

      <Section title="Accessibility" theme={theme}>
        <SettingRow theme={theme} label="Large text" description="Increase text size across the app"
          value={settings.largeTextEnabled} onChange={(v) => handleToggle('largeTextEnabled', v)} />
      </Section>

      <Pressable style={[styles.logoutButton, { borderColor: theme.border }]} onPress={handleLogout} disabled={loggingOut}>
        {loggingOut ? <ActivityIndicator color={theme.text} /> : <Text style={{ color: '#EF4444', fontWeight: '600' }}>Log Out</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, theme, children }: { title: string; theme: any; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function SettingRow({ theme, label, description, value, onChange }: {
  theme: any; label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        {!!description && <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{description}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 60 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  sectionCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
  label: { fontSize: 14, fontWeight: '600' },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pill: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  logoutButton: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
});