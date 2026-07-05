import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { logoutUser } from '../services/authService';
import { toggleTaskCompletion, deleteTask } from '../services/taskservice';
import { Task, PRIORITY_ORDER } from '../types/task';
import TaskCard from '../components/TaskCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [loggingOut, setLoggingOut] = useState(false);

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });

  async function handleToggle(task: Task) {
    // Optimistic feel: Firestore's onSnapshot updates the list itself,
    // so we just fire the request — no local state juggling needed.
    const { error: toggleError } = await toggleTaskCompletion(task.id, !task.completed);
    if (toggleError) Alert.alert('Error', toggleError);
  }

  function handlePress(task: Task) {
    navigation.navigate('AddEditTask', { taskId: task.id });
  }


  
  function handleDelete(task: Task) {
    Alert.alert('Delete task?', `"${task.title}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error: deleteError } = await deleteTask(task.id);
          if (deleteError) Alert.alert('Error', deleteError);
        },
      },
    ]);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    setLoggingOut(false);
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Welcome, {user?.displayName || 'there'}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
            {tasks.length === 0
              ? 'No tasks yet'
              : `${completedCount} of ${tasks.length} completed`}
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Rewards')} style={{ marginTop: 6 }}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>🎁 Rewards</Text>
        </Pressable>
        <Pressable onPress={handleLogout} disabled={loggingOut} hitSlop={8}>
          {loggingOut ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <Text style={{ color: theme.textSecondary }}>Log Out</Text>
          )}
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.errorText]}>{error}</Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TaskCard task={item} onToggle={handleToggle} onPress={handlePress} onDelete={handleDelete}/>
          )}
          onScrollBeginDrag={() => {}}
          ListEmptyComponent={
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Tap + to add your first task.
            </Text>
          }
          // long-press to delete, kept simple for now
          extraData={tasks}
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddEditTask')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },

});