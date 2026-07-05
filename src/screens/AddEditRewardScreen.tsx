import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { RewardFormData } from '../types/reward';
import { createReward, updateReward, deleteReward, subscribeToRewards } from '../services/rewardService';
import { validateRewardForm, RewardFormErrors } from '../utils/validation';

type Props = NativeStackScreenProps<AppStackParamList, 'AddEditReward'>;

export default function AddEditRewardScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const rewardId = route.params?.rewardId;
  const isEditing = !!rewardId;

  const [form, setForm] = useState<RewardFormData>({ title: '', description: '', cost: 50 });
  const [costText, setCostText] = useState('50');
  const [errors, setErrors] = useState<RewardFormErrors>({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing || !user) return;
    const unsubscribe = subscribeToRewards(
      user.uid,
      (rewards) => {
        const existing = rewards.find((r) => r.id === rewardId);
        if (existing) {
          setForm({ title: existing.title, description: existing.description, cost: existing.cost });
          setCostText(String(existing.cost));
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [isEditing, rewardId, user]);

  async function handleSave() {
    const validationErrors = validateRewardForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!user) return;

    setSaving(true);
    const result = isEditing
      ? await updateReward(rewardId!, form)
      : await createReward(user.uid, form);
    setSaving(false);

    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }
    navigation.goBack();
  }

  function handleDelete() {
    if (!rewardId) return;
    Alert.alert('Delete reward?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteReward(rewardId);
          if (error) {
            Alert.alert('Error', error);
          } else {
            navigation.goBack();
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>
          {isEditing ? 'Edit Reward' : 'New Reward'}
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Title</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.title ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="e.g. Watch a movie"
            placeholderTextColor={theme.textSecondary}
            value={form.title}
            onChangeText={(title) => setForm({ ...form, title })}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="Optional details"
            placeholderTextColor={theme.textSecondary}
            value={form.description}
            onChangeText={(description) => setForm({ ...form, description })}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Cost (points)</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.cost ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="50"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            value={costText}
            onChangeText={(text) => {
              setCostText(text);
              const parsed = parseInt(text, 10);
              setForm({ ...form, cost: Number.isNaN(parsed) ? 0 : parsed });
            }}
          />
          {errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkWrap}>
          <Text style={{ color: theme.textSecondary }}>Cancel</Text>
        </Pressable>

        {isEditing && (
          <Pressable onPress={handleDelete} style={styles.linkWrap}>
            <Text style={{ color: '#EF4444' }}>Delete Reward</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 40 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  button: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkWrap: { marginTop: 16, alignItems: 'center' },
});