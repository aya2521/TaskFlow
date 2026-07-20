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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [loggingOut, setLoggingOut] = useState(false);
  const insets = useSafeAreaInsets();

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });

  async function handleToggle(task: Task) {
    const { error: toggleError } = await toggleTaskCompletion(task.id, !task.completed, task.notificationIds);
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
          const { error: deleteError } = await deleteTask(task.id, task.notificationIds);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Pressable onPress={() => navigation.navigate('Account')} hitSlop={8}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.errorText]}>{error}</Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <TaskCard task={item} onToggle={handleToggle} onPress={handlePress} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Tap + to add your first task.
            </Text>
          }
          extraData={tasks}
        />
      )}

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.surface, borderColor: theme.border, paddingBottom: insets.bottom + 12 },
        ]}
      >
        <Pressable onPress={() => navigation.navigate('Statistics')} style={styles.bottomBarButton} hitSlop={10}>
          <Text style={styles.bottomBarIcon}>📊</Text>
          <Text style={[styles.bottomBarLabel, { color: theme.textSecondary }]}>Stats</Text>
        </Pressable>

        <Pressable
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddEditTask')}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Rewards')} style={styles.bottomBarButton} hitSlop={10}>
          <Text style={styles.bottomBarIcon}>🎁</Text>
          <Text style={[styles.bottomBarLabel, { color: theme.textSecondary }]}>Rewards</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 40 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  bottomBarButton: { alignItems: 'center', width: 64 },
  bottomBarIcon: { fontSize: 22 },
  bottomBarLabel: { fontSize: 11, marginTop: 2 },
  fab: {
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
    marginTop: -20,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});