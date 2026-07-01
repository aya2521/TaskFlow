import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    // No need to manually navigate — AuthContext listener detects the
    // sign-out and RootNavigator swaps back to the auth stack automatically.
    setLoggingOut(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Home</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
        Welcome, {user?.displayName || user?.email}
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        Task list comes in Phase 3
      </Text>

      <Pressable
        style={[styles.logoutButton, { borderColor: theme.border }]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <Text style={{ color: theme.text, fontWeight: '600' }}>Log Out</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  logoutButton: {
    marginTop: 32,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});