import { Task, TaskPriority } from '../types/task';

export interface WeeklyCompletion {
  label: string;   
  count: number;
}

export interface PriorityBreakdown {
  priority: TaskPriority;
  count: number;
}

export function getCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}


export function getWeeklyCompletions(tasks: Task[]): WeeklyCompletion[] {
  const days: WeeklyCompletion[] = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = tasks.filter((t) => {
      if (!t.completed) return false;
      const updated = new Date(t.updatedAt);
      return updated >= date && updated < nextDate;
    }).length;

    days.push({ label: dayLabels[date.getDay()], count });
  }

  return days;
}

export function getPriorityBreakdown(tasks: Task[]): PriorityBreakdown[] {
  const priorities: TaskPriority[] = ['high', 'medium', 'low'];
  return priorities.map((priority) => ({
    priority,
    count: tasks.filter((t) => t.priority === priority).length,
  }));
}

export function getCurrentStreak(tasks: Task[]): number {
  const completionDates = new Set(
    tasks
      .filter((t) => t.completed)
      .map((t) => {
        const d = new Date(t.updatedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (completionDates.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}