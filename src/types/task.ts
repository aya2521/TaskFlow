export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  frequency: TaskFrequency;
  priority: TaskPriority;
  completed: boolean;
  dueDate: string | null;   // ISO string, or null for no due date
  notificationIds: string[]; 
  createdAt: string;        // ISO string
  updatedAt: string;        // ISO string
}

// Fields the user actually fills in on the Add/Edit form
export type TaskFormData = {
  title: string;
  description: string;
  frequency: TaskFrequency;
  priority: TaskPriority;
  dueDate: string | null;
};

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};