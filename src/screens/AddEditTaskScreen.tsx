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
import { TaskFormData, TaskFrequency, TaskPriority } from '../types/task';
import { createTask, updateTask, deleteTask, subscribeToTasks } from '../services/taskservice';
import { validateTaskForm, TaskFormErrors } from '../utils/validation';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<AppStackParamList, 'AddEditTask'>;

const FREQUENCIES: TaskFrequency[] = ['once', 'daily', 'weekly', 'monthly'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];


export default function AddEditTaskScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    frequency: 'once',
    priority: 'medium',
    dueDate: null,
  });
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [existingNotificationIds, setExistingNotificationIds] = useState<string[]>([]);

  // Reuse subscribeToTasks to grab the one task we're editing, then
  // immediately unsubscribe — avoids a separate getDoc-by-id service function.
  useEffect(() => {
    if (!isEditing || !user) return;
    const unsubscribe = subscribeToTasks(
      user.uid,
      (tasks) => {
        const existing = tasks.find((t) => t.id === taskId);
        if (existing) {
          setForm({
            title: existing.title,
            description: existing.description,
            frequency: existing.frequency,
            priority: existing.priority,
            dueDate: existing.dueDate,
          });
          setExistingNotificationIds(existing.notificationIds);

        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [isEditing, taskId, user]);

  async function handleSave() {
    const validationErrors = validateTaskForm(form);
    const prelimResult = isEditing
      ? await updateTask(taskId!, form, existingNotificationIds)
      : await createTask(user?.uid ?? '', form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!user) return;

    setSaving(true);
    const result = isEditing
      ? await updateTask(taskId!, form, existingNotificationIds)
      : await createTask(user.uid, form);
    setSaving(false);

    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }
    navigation.goBack();
  }

  function handleDelete() {
    if (!taskId) return;
    Alert.alert('Delete task?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteTask(taskId, existingNotificationIds);
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
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Title</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.title ? '#EF4444' : theme.border, color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="e.g. Morning workout"
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
          <Text style={[styles.label, { color: theme.text }]}>Repeat</Text>
          <View style={styles.pillRow}>
            {FREQUENCIES.map((freq) => (
              <Pressable
                key={freq}
                onPress={() => setForm({ ...form, frequency: freq })}
                style={[
                  styles.pill,
                  {
                    borderColor: theme.border,
                    backgroundColor: form.frequency === freq ? theme.primary : 'transparent',
                  },
                ]}
              >
                <Text style={{ color: form.frequency === freq ? '#fff' : theme.text, fontSize: 13 }}>
                  {freq === 'once' ? 'One-time' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
          <View style={styles.pillRow}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p}
                onPress={() => setForm({ ...form, priority: p })}
                style={[
                  styles.pill,
                  {
                    borderColor: theme.border,
                    backgroundColor: form.priority === p ? theme.primary : 'transparent',
                  },
                ]}
              >
                <Text style={{ color: form.priority === p ? '#fff' : theme.text, fontSize: 13 }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Due Date</Text>
          <Pressable
            onPress={() => setShowPicker(true)}
            style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, justifyContent: 'center' }]}
          >
            <Text style={{ color: form.dueDate ? theme.text : theme.textSecondary }}>
              {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'No due date'}
            </Text>
          </Pressable>

          {form.dueDate && (
            <Pressable onPress={() => setForm({ ...form, dueDate: null })} style={{ marginTop: 6 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Clear due date</Text>
            </Pressable>
          )}

          {showPicker && (
            <DateTimePicker
              value={form.dueDate ? new Date(form.dueDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, selectedDate) => {
                setShowPicker(Platform.OS === 'ios');
                if (event.type === 'set' && selectedDate) {
                  setForm({ ...form, dueDate: selectedDate.toISOString() });
                }
              }}
            />
          )}
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
            <Text style={{ color: '#EF4444' }}>Delete Task</Text>
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
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  button: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkWrap: { marginTop: 16, alignItems: 'center' },
});