import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../types/task';

interface Props {
  task: Task;
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function TaskCard({ task, onToggle, onPress, onDelete }: Props) {
  const { theme } = useTheme();

  function renderRightAction(progress: Animated.AnimatedInterpolation<number>) {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });
    return (
      <Pressable onPress={() => onDelete(task)} style={styles.deleteAction}>
        <Animated.Text style={[styles.deleteText, { transform: [{ translateX }] }]}>
          Delete
        </Animated.Text>
      </Pressable>
    );
  }

  return (
    <Swipeable renderRightActions={renderRightAction} overshootRight={false}>
      <Pressable
        onPress={() => onPress(task)}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Pressable
          onPress={() => onToggle(task)}
          hitSlop={8}
          style={[
            styles.checkbox,
            { borderColor: theme.primary, backgroundColor: task.completed ? theme.primary : 'transparent' },
          ]}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {task.frequency === 'once' ? 'One-time' : capitalize(task.frequency)}
            </Text>
            {task.dueDate && (
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                · {formatDueDate(task.dueDate)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  priorityDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  metaText: { fontSize: 12 },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});