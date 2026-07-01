import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { registerUser } from '../services/authService';
import { validateRegisterForm, RegisterFormErrors } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleRegister() {
    const validationErrors = validateRegisterForm(displayName, email, password, confirmPassword);
    setErrors(validationErrors);
    setAuthError(null);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const result = await registerUser(email.trim(), password, displayName.trim());
    setLoading(false);

    if (result.error) {
      setAuthError(result.error);
    }
    // Success: AuthContext listener flips `user`, RootNavigator swaps to Home.
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Start organizing your tasks with Task Flow
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.displayName ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface }]}
            placeholder="Jane Doe"
            placeholderTextColor={theme.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
          />
          {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.email ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface }]}
            placeholder="you@example.com"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.password ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface }]}
            placeholder="At least 6 characters"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.confirmPassword ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface }]}
            placeholder="Re-enter your password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {authError && (
          <View style={styles.authErrorBox}>
            <Text style={styles.authErrorText}>{authError}</Text>
          </View>
        )}

        <Pressable
          style={[styles.button, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
          <Text style={{ color: theme.textSecondary }}>
            Already have an account? <Text style={{ color: theme.primary, fontWeight: '600' }}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 28 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  authErrorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  authErrorText: { color: '#B91C1C', fontSize: 13 },
  button: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkWrap: { marginTop: 20, alignItems: 'center' },
});