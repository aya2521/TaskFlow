import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import Logo from '../components/Logo';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.center}>
        <Logo size={100} />
        <Text style={[styles.title, { color: theme.text }]}>Task Flow</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Build habits. Earn rewards. Get things done.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Log In</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryButton, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 20 },
  tagline: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  actions: { gap: 12 },
  primaryButton: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1 },
  secondaryButtonText: { fontSize: 16, fontWeight: '600' },
});