import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskFormData } from '../types/task';

const TASKS_COLLECTION = 'tasks';

// Firestore stores Timestamps; the rest of the app works with ISO strings.
// This keeps that conversion in exactly one place.
function toTask(id: string, data: any): Task {
  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description ?? '',
    frequency: data.frequency,
    priority: data.priority,
    completed: data.completed ?? false,
    dueDate: data.dueDate ?? null,
    createdAt: (data.createdAt as Timestamp)?.toDate?.().toISOString() ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.().toISOString() ?? new Date().toISOString(),
  };
}

// Real-time listener — call once (e.g. in a hook) and it keeps firing
// whenever tasks change anywhere (this device or another).
export function subscribeToTasks(
  userId: string,
  onChange: (tasks: Task[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => toTask(d.id, d.data()));
      onChange(tasks);
    },
    (error) => {
      onError('Failed to load tasks. Check your connection.');
      console.error('subscribeToTasks error:', error);
    }
  );
}

export async function createTask(userId: string, form: TaskFormData): Promise<{ error: string | null }> {
  try {
    await addDoc(collection(db, TASKS_COLLECTION), {
      userId,
      title: form.title.trim(),
      description: form.description.trim(),
      frequency: form.frequency,
      priority: form.priority,
      dueDate: form.dueDate,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    console.error('createTask error:', err);
    return { error: 'Failed to create task. Please try again.' };
  }
}

export async function updateTask(taskId: string, form: TaskFormData): Promise<{ error: string | null }> {
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
      title: form.title.trim(),
      description: form.description.trim(),
      frequency: form.frequency,
      priority: form.priority,
      dueDate: form.dueDate,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    console.error('updateTask error:', err);
    return { error: 'Failed to update task. Please try again.' };
  }
}

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<{ error: string | null }> {
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
      completed,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    console.error('toggleTaskCompletion error:', err);
    return { error: 'Failed to update task.' };
  }
}

export async function deleteTask(taskId: string): Promise<{ error: string | null }> {
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    return { error: null };
  } catch (err) {
    console.error('deleteTask error:', err);
    return { error: 'Failed to delete task. Please try again.' };
  }
}